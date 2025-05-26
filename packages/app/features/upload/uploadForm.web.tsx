'use client'
import React, { useState, useEffect, ComponentType, useCallback, useMemo } from 'react'
import {
  AnimatePresence,
  Button,
  Form,
  H1,
  Input as TamaguiInput,
  Label,
  Spinner,
  Text,
  TextArea,
  View,
  XStack,
  YStack,
  Select,
  Adapt,
  Sheet,
  ScrollView,
  // Separator, // Not used
} from '@my/ui'
import { Info, UploadCloud } from '@tamagui/lucide-icons'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { SafeAreaView, Platform } from 'react-native'
import { useMutation, useAction } from 'convex/react'
import { api } from '../../../../convex/_generated/api' // Adjusted path for clarity
import { useRouter } from 'solito/navigation'
import * as tus from 'tus-js-client'
import type { Id } from '../../../../convex/_generated/dataModel' // Adjusted path
import type { FilePickerProps, NativeFileAsset } from './types'
import { useEntityList } from '@replyke/react-js'

const FormCard = YStack

const DEBUG_RENDER = false // Keep this if you use it, or remove
const DEBUG_TUS = true // Added for TUS specific logs

const InputComponent = React.memo(
  ({
    label,
    children,
    errorMessage,
    id,
    ...rest
  }: {
    label: string
    children: React.ReactNode
    errorMessage?: string
    id?: string
  } & YStack['props']) => {
    if (DEBUG_RENDER) {
      console.log(
        `InputComponent rendered - Label: ${label}, ID: ${id}, HasError: ${!!errorMessage}`
      )
    }
    return (
      <YStack gap="$2" {...rest}>
        <Label htmlFor={id} onLayout={undefined} Unmz={undefined}>
          {label}
        </Label>
        {children}
        <AnimatePresence>
          {errorMessage && (
            <XStack
              gap="$2"
              animation="bouncy"
              enterStyle={{ opacity: 0, y: -5 }}
              exitStyle={{ opacity: 0, y: -5 }}
            >
              <Info size="$1" color="$red10" />
              <Text fontSize="$2" color="$red10">
                {errorMessage}
              </Text>
            </XStack>
          )}
        </AnimatePresence>
      </YStack>
    )
  }
)
InputComponent.displayName = 'InputComponent'

export const videoFileSchemaPart = Platform.select({
  web: z
    .instanceof(File)
    .refine((file) => file && file.size > 0, 'Video file is required.')
    .refine(
      (file) => file && file.type.startsWith('video/'),
      'File must be a video type (e.g., video/mp4).'
    ),
  default: z
    .object({
      uri: z.string().min(1, 'File URI is missing'),
      name: z.string().min(1, 'File name is missing'),
      type: z.string().optional(),
      size: z
        .number()
        .optional()
        .refine(
          (s) => s === undefined || s > 0,
          'File size is invalid if provided and not positive'
        ),
      file: z.any().optional(),
    })
    .refine(
      (file) =>
        (file.type && file.type.startsWith('video/')) ||
        (!file.type && file.name && file.name.match(/\.(mp4|mov|avi|mkv|webm|m4v|quicktime)$/i)),
      'Selected file must be a video.'
    )
    .nullable()
    .optional(),
})

export const videoSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .max(100, { message: 'Title must be 100 characters or less' }),
  description: z
    .string()
    .max(5000, { message: 'Description must be 5000 characters or less' })
    .optional(),
  tags: z.string().optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  videoFile: videoFileSchemaPart as z.ZodType<VideoFileFieldType>,
})

export type VideoFormData = z.infer<typeof videoSchema>
export type VideoFileFieldType = z.infer<typeof videoFileSchemaPart>

const BUNNY_TUS_ENDPOINT = 'https://video.bunnycdn.com/tusupload'

interface UploadVideoFormProps {
  libraryId: string
  FilePickerComponent: ComponentType<FilePickerProps>
}

export function CoreUploadVideoForm({ libraryId, FilePickerComponent }: UploadVideoFormProps) {
  if (DEBUG_RENDER) {
    console.log('CoreUploadVideoForm rendered.')
  }

  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const router = useRouter()
  const createVideoMetadataMutation = useMutation(api.videos.createVideoMetadata)
  const generateBunnyCredentialsAction = useAction(api.bunnyActions.generateBunnyUploadCredentials)
  const updateVideoDetailsMutation = useMutation(api.videos.updateVideoDetails)
  const { createEntity: createReplykeEntity } = useEntityList({ sourceId: 'videos' })

  useEffect(() => {
    if (!libraryId) {
      console.warn('UploadVideoForm: libraryId prop is missing or invalid.')
      setFormError('Configuration error: Library ID missing.')
    }
  }, [libraryId])

  const memoizedDefaultValues = useMemo(
    () => ({
      title: '',
      description: '',
      tags: '',
      visibility: 'public' as 'public' | 'private' | 'unlisted',
      videoFile: undefined,
    }),
    []
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: memoizedDefaultValues,
  })

  // const videoFile = watch('videoFile'); // data.videoFile is used in onSubmit

  const onSubmit = useCallback(
    async (data: VideoFormData) => {
      if (DEBUG_TUS) console.log('[TUS DEBUG] onSubmit triggered with data:', data)
      setLoading(true)
      setFormError(null)
      setUploadProgress(0) // Initialize progress

      if (!libraryId) {
        if (DEBUG_TUS) console.error('[TUS DEBUG] Library ID missing in onSubmit.')
        setFormError('Video upload service is not configured (Library ID missing).')
        setLoading(false)
        return
      }

      const currentVideoFile = data.videoFile
      if (!currentVideoFile) {
        if (DEBUG_TUS) console.error('[TUS DEBUG] Video file missing in onSubmit.')
        setFormError('No video file selected or file is invalid.')
        setLoading(false)
        return
      }

      let convexVideoId: Id<'videos'> | null = null

      try {
        if (DEBUG_TUS) console.log('[TUS DEBUG] Creating video metadata in Convex...')
        const convexVideoResult = await createVideoMetadataMutation({
          title: data.title,
          description: data.description,
          tags: data.tags
            ?.split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag),
          visibility: data.visibility,
        })

        if (!convexVideoResult || !convexVideoResult._id) {
          throw new Error('Failed to create video metadata in Convex or returned no ID.')
        }
        convexVideoId = convexVideoResult._id
        if (DEBUG_TUS) console.log('[TUS DEBUG] Convex video metadata created, ID:', convexVideoId)

        if (createReplykeEntity && convexVideoId) {
          try {
            if (DEBUG_TUS)
              console.log(
                '[TUS DEBUG] Attempting to create Replyke entity for convexVideoId:',
                convexVideoId
              )
            const newReplykeEntity = await createReplykeEntity({
              title: data.title,
              content: data.description || `Watch the video: ${data.title}`,
              sourceId: 'videos',
              metadata: {
                convexVideoId: convexVideoId,
                videoTitle: data.title,
              },
              keywords:
                data.tags
                  ?.split(',')
                  .map((t) => t.trim())
                  .filter((t) => t) || [],
            })

            if (newReplykeEntity && newReplykeEntity.id && newReplykeEntity.shortId) {
              if (DEBUG_TUS)
                console.log(
                  '[TUS DEBUG] Replyke entity created:',
                  newReplykeEntity.id,
                  newReplykeEntity.shortId
                )
              await updateVideoDetailsMutation({
                convexVideoId,
                replykeEntityId: newReplykeEntity.id,
                replykeEntityShortId: newReplykeEntity.shortId,
                replykeForeignId: convexVideoId,
              })
              if (DEBUG_TUS) console.log('[TUS DEBUG] Convex video updated with Replyke IDs.')
            } else {
              console.warn(
                '[TUS DEBUG] Replyke entity creation did not return expected IDs:',
                newReplykeEntity
              )
              setFormError((prev) =>
                prev ? `${prev}; Replyke entity issue.` : 'Replyke entity issue.'
              )
            }
          } catch (replykeError: any) {
            console.error('[TUS DEBUG] Failed to create or link Replyke entity:', replykeError)
            setFormError((prev) =>
              prev
                ? `${prev}; Failed to create comment entity (${replykeError.message})`
                : `Failed to create comment entity (${replykeError.message})`
            )
          }
        } else if (!createReplykeEntity) {
          console.warn(
            '[TUS DEBUG] createReplykeEntity function is not available. Did you wrap with EntityListProvider?'
          )
          setFormError((prev) =>
            prev ? `${prev}; Comment entity creation skipped.` : 'Comment entity creation skipped.'
          )
        }

        if (DEBUG_TUS) console.log('[TUS DEBUG] Generating Bunny credentials...')
        const bunnyUploadData = await generateBunnyCredentialsAction({
          title: data.title,
          collectionId: undefined, // Ensure this is what you intend
          convexVideoId: convexVideoId,
        })

        if (
          !bunnyUploadData ||
          !bunnyUploadData.bunnyVideoGUID ||
          !bunnyUploadData.signature ||
          !bunnyUploadData.expires ||
          !bunnyUploadData.libraryId
        ) {
          throw new Error(
            'Failed to prepare video for upload with Bunny Stream. Credentials missing.'
          )
        }
        const { bunnyVideoGUID, signature, expires, libraryId: bunnyLibraryId } = bunnyUploadData
        if (DEBUG_TUS)
          console.log('[TUS DEBUG] Bunny credentials generated:', {
            bunnyVideoGUID,
            signature,
            expires,
            bunnyLibraryId,
          })

        await updateVideoDetailsMutation({ convexVideoId, status: 'uploading' })
        if (DEBUG_TUS) console.log('[TUS DEBUG] Convex video status updated to "uploading".')

        let uploadableForTus: File
        let tusMetadata: tus.UploadOptions['metadata']

        if (Platform.OS === 'web' && currentVideoFile instanceof File) {
          uploadableForTus = currentVideoFile
          tusMetadata = {
            filetype: currentVideoFile.type,
            title: data.title,
            name: currentVideoFile.name,
          }
        } else if (
          Platform.OS !== 'web' &&
          typeof currentVideoFile === 'object' &&
          currentVideoFile !== null &&
          'uri' in currentVideoFile
        ) {
          const nativeFile = currentVideoFile as NativeFileAsset
          if (nativeFile.file instanceof File) {
            uploadableForTus = nativeFile.file
          } else if (nativeFile.uri) {
            const response = await fetch(nativeFile.uri)
            if (!response.ok) throw new Error(`Failed to fetch native file: ${response.statusText}`)
            const blob = await response.blob()
            uploadableForTus = new File([blob], nativeFile.name || 'video_from_native.mp4', {
              type: nativeFile.type || (blob.type !== '' ? blob.type : 'application/octet-stream'),
            })
          } else {
            throw new Error(
              'Unsupported native file structure for TUS upload: URI missing and no File object.'
            )
          }
          tusMetadata = {
            filetype: uploadableForTus.type,
            title: data.title,
            name: uploadableForTus.name,
          }
        } else {
          console.error('[TUS DEBUG] Invalid video file structure:', currentVideoFile)
          throw new Error('Invalid video file provided for TUS upload.')
        }

        if (DEBUG_TUS) {
          console.log('[TUS DEBUG] Prepared file for TUS:', uploadableForTus)
          console.log('[TUS DEBUG] TUS Metadata:', tusMetadata)
          console.log('[TUS DEBUG] TUS Headers:', {
            AuthorizationSignature: signature,
            AuthorizationExpire: expires.toString(),
            VideoId: bunnyVideoGUID,
            LibraryId: bunnyLibraryId,
          })
          console.log('[TUS DEBUG] TUS Endpoint:', BUNNY_TUS_ENDPOINT)
          console.log('[TUS DEBUG] TUS File Size:', uploadableForTus.size)
        }

        // In your CoreUploadVideoForm component, within the tus.Upload options:

        const upload = new tus.Upload(uploadableForTus, {
          endpoint: BUNNY_TUS_ENDPOINT,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            AuthorizationSignature: signature,
            AuthorizationExpire: expires.toString(),
            VideoId: bunnyVideoGUID,
            LibraryId: bunnyLibraryId,
          },
          metadata: tusMetadata,
          // MODIFICATION: Explicitly set chunkSize for web as well
          chunkSize: 5 * 1024 * 1024, // 5MB chunks for all platforms
          uploadSize: uploadableForTus.size,
          onError: async (error) => {
            if (DEBUG_TUS) console.error('[TUS DEBUG] TUS onError Fired:', error)
            console.error('Failed to upload to Bunny Stream:', error)
            setFormError(`Upload failed: ${(error as Error).message || 'Unknown TUS error'}`)
            if (convexVideoId) {
              await updateVideoDetailsMutation({ convexVideoId, status: 'failed_upload' })
            }
            setLoading(false)
            setUploadProgress(null)
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            // Keep this log to see what tus-js-client reports for onProgress
            if (DEBUG_TUS)
              console.log('[TUS DEBUG] TUS onProgress Fired:', { bytesUploaded, bytesTotal })
            let percentage = 0
            if (bytesTotal > 0) {
              percentage = (bytesUploaded / bytesTotal) * 100
            } else if (bytesUploaded > 0 && bytesTotal === 0) {
              // If total not known yet
              percentage = 1 // Show minimal progress
            }
            const clampedPercentage = Math.min(Math.max(percentage, 0), 100)
            setUploadProgress(clampedPercentage)
          },
          // ADDITION: onChunkComplete callback for more detailed logging
          onChunkComplete: function (chunkSize, bytesAccepted, bytesTotal) {
            if (DEBUG_TUS) {
              console.log('[TUS DEBUG] TUS onChunkComplete Fired:', {
                chunkSize,
                bytesAccepted,
                bytesTotal,
              })
            }
            // Optional: If onProgress continues to misreport bytesUploaded,
            // you could use bytesAccepted from here to update your progress bar.
            // However, onProgress should ideally work.
            // if (bytesTotal > 0) {
            //   const percentage = (bytesAccepted / bytesTotal) * 100;
            //   setUploadProgress(Math.min(Math.max(percentage, 0), 100));
            // }
          },
          onSuccess: async () => {
            if (DEBUG_TUS) console.log('[TUS DEBUG] TUS onSuccess Fired')
            // ... rest of your onSuccess logic
            console.log('Upload successful to Bunny Stream! Video GUID:', bunnyVideoGUID)
            if (convexVideoId) {
              await updateVideoDetailsMutation({
                convexVideoId,
                status: 'processing',
              })
            }
            setLoading(false)
            setUploadProgress(100)
            reset(memoizedDefaultValues)
            setValue('videoFile', undefined)
            alert('Video upload initiated successfully! It will be processed shortly.')
          },
        })

        if (DEBUG_TUS) console.log('[TUS DEBUG] Starting TUS upload...')
        upload.start()
      } catch (error: any) {
        if (DEBUG_TUS) console.error('[TUS DEBUG] Error in overall upload process:', error)
        console.error('Error in overall upload process:', error)
        setFormError((prev) =>
          prev
            ? `${prev}; Overall error: ${error.message || 'An unexpected error occurred.'}`
            : error.message || 'An unexpected error occurred.'
        )
        if (
          convexVideoId &&
          !(
            error.data?.type === 'ConvexError' && error.data.code === 'ObjectIsMissingRequiredField'
          )
        ) {
          try {
            await updateVideoDetailsMutation({ convexVideoId, status: 'failed_upload' })
          } catch (updateError) {
            console.error('Failed to update video status to failed_upload', updateError)
          }
        }
        setLoading(false)
        setUploadProgress(null)
      }
    },
    [
      libraryId,
      createVideoMetadataMutation,
      generateBunnyCredentialsAction,
      updateVideoDetailsMutation,
      reset,
      memoizedDefaultValues,
      setValue,
      createReplykeEntity,
    ]
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '$background' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <FormCard
          padding="$4"
          gap="$5"
          borderColor="$borderColor"
          borderRadius="$4"
          paddingHorizontal={Platform.OS === 'web' ? '30%' : '$0'}
          $gtMd={{ marginHorizontal: '$10' }}
        >
          <Form onSubmit={handleSubmit(onSubmit)} gap="$5">
            <H1 alignSelf="center" size="$8" $xs={{ size: '$7' }} color="$color12">
              Upload Video
            </H1>

            {formError && (
              <Text
                color="$red10"
                textAlign="center"
                padding="$2"
                backgroundColor="$red3"
                borderRadius="$3"
              >
                {formError}
              </Text>
            )}

            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <InputComponent label="Title" errorMessage={errors.title?.message} id="video-title">
                  <TamaguiInput
                    {...field}
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Enter video title"
                    disabled={loading}
                    size="$4"
                  />
                </InputComponent>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <InputComponent
                  label="Description (optional)"
                  errorMessage={errors.description?.message}
                  id="video-description"
                >
                  <TextArea
                    {...field}
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Tell viewers about your video"
                    disabled={loading}
                    size="$4"
                    minHeight={100}
                  />
                </InputComponent>
              )}
            />

            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <InputComponent
                  label="Tags (comma-separated, optional)"
                  errorMessage={errors.tags?.message}
                  id="video-tags"
                >
                  <TamaguiInput
                    {...field}
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="e.g., gaming, tutorial, vlog"
                    disabled={loading}
                    size="$4"
                  />
                </InputComponent>
              )}
            />

            <Controller
              control={control}
              name="visibility"
              render={({ field }) => (
                <InputComponent
                  label="Visibility"
                  errorMessage={errors.visibility?.message}
                  id="video-visibility"
                >
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loading}
                    native={Platform.OS !== 'web'}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select visibility" />
                    </Select.Trigger>
                    <Adapt when="sm" platform="touch">
                      <Sheet modal dismissOnSnapToBottom snapPointsMode="fit">
                        <Sheet.Frame>
                          <Sheet.ScrollView>
                            <Adapt.Contents />
                          </Sheet.ScrollView>
                        </Sheet.Frame>
                        <Sheet.Overlay
                          animation="lazy"
                          enterStyle={{ opacity: 0 }}
                          exitStyle={{ opacity: 0 }}
                        />
                      </Sheet>
                    </Adapt>
                    <Select.Content zIndex={200000}>
                      <Select.Viewport>
                        <Select.Item index={0} value="public">
                          <Select.ItemText>Public</Select.ItemText>
                        </Select.Item>
                        <Select.Item index={1} value="private">
                          <Select.ItemText>Private</Select.ItemText>
                        </Select.Item>
                        <Select.Item index={2} value="unlisted">
                          <Select.ItemText>Unlisted</Select.ItemText>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select>
                </InputComponent>
              )}
            />

            <Controller
              name="videoFile"
              control={control}
              render={({ field: { onChange, value: rhfValue } }) => (
                <InputComponent
                  label="Video File*"
                  errorMessage={errors.videoFile?.message as string | undefined}
                  id="video-file-upload"
                >
                  <FilePickerComponent
                    onFileSelected={(fileAsset) => {
                      onChange(fileAsset)
                    }}
                    disabled={loading}
                    currentFile={rhfValue as VideoFileFieldType | undefined}
                  />
                </InputComponent>
              )}
            />

            {loading && uploadProgress !== null && (
              <YStack gap="$2" ai="center">
                <Text>
                  {uploadProgress === 100 && !formError
                    ? 'Finalizing...'
                    : `Uploading: ${Math.min(uploadProgress, 100).toFixed(0)}%`}
                </Text>
                <View
                  width="100%"
                  height={10}
                  backgroundColor="$color5"
                  borderRadius="$2"
                  overflow="hidden"
                >
                  <View
                    width={`${Math.min(uploadProgress, 100)}%`}
                    height="100%"
                    backgroundColor="$blue10"
                  />
                </View>
              </YStack>
            )}

            <Form.Trigger asChild disabled={loading}>
              <Button
                icon={loading && uploadProgress === null ? <Spinner /> : UploadCloud}
                disabled={loading}
                marginTop="$5"
              >
                {loading
                  ? uploadProgress === null
                    ? 'Preparing...'
                    : uploadProgress === 100 && !formError
                      ? 'Finalizing...'
                      : 'Uploading...'
                  : 'Upload Video'}
              </Button>
            </Form.Trigger>
          </Form>
        </FormCard>
      </ScrollView>
    </SafeAreaView>
  )
}
