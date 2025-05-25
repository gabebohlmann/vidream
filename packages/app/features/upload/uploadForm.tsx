// packages/app/features/upload/uploadForm.tsx
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

const FormCard = YStack

const DEBUG_RENDER = false

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
          {' '}
          {/* Added Unmz={undefined} for potential Tamagui prop */}
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
    .refine((file) => file && file.size > 0, 'Video file is required.') // Added check for file existence
    .refine(
      (file) => file && file.type.startsWith('video/'), // Added check for file existence
      'File must be a video type (e.g., video/mp4).'
    ),
  default: z // For native
    .object({
      uri: z.string().min(1, 'File URI is missing'),
      name: z.string().min(1, 'File name is missing'),
      type: z.string().optional(), // Mime type
      size: z
        .number()
        .optional() // Size might not always be available immediately
        .refine(
          (s) => s === undefined || s > 0,
          'File size is invalid if provided and not positive'
        ),
      file: z.any().optional(), // This will hold the File object created from URI for TUS
    })
    .refine(
      (
        file // Check based on mimeType or extension
      ) =>
        (file.type && file.type.startsWith('video/')) ||
        (!file.type && file.name && file.name.match(/\.(mp4|mov|avi|mkv|webm|m4v|quicktime)$/i)), // Added quicktime
      'Selected file must be a video.'
    )
    .nullable() // Allow the field to be null initially before a file is picked
    .optional(), // Make the whole object optional or nullable depending on RHF default
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
  videoFile: videoFileSchemaPart as z.ZodType<VideoFileFieldType>, // Explicitly cast for clarity
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
      videoFile: undefined, // Initialize videoFile as undefined
    }),
    []
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue, // Added setValue to potentially clear file input
  } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: memoizedDefaultValues,
  })

  const videoFile = watch('videoFile')

  const onSubmit = useCallback(
    async (data: VideoFormData) => {
      setLoading(true)
      setFormError(null)
      setUploadProgress(0)

      if (!libraryId) {
        setFormError('Video upload service is not configured (Library ID missing).')
        setLoading(false)
        return
      }

      const currentVideoFile = data.videoFile // Get from validated data
      if (!currentVideoFile) {
        setFormError('No video file selected or file is invalid.')
        setLoading(false)
        return
      }

      let convexVideoId: Id<'videos'> | null = null

      try {
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

        const bunnyUploadData = await generateBunnyCredentialsAction({
          title: data.title,
          collectionId: undefined,
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

        await updateVideoDetailsMutation({ convexVideoId, status: 'uploading' })

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
            // If File object is already prepared (e.g., from cache)
            uploadableForTus = nativeFile.file
          } else if (nativeFile.uri) {
            const response = await fetch(nativeFile.uri)
            if (!response.ok) throw new Error(`Failed to fetch native file: ${response.statusText}`)
            const blob = await response.blob()
            uploadableForTus = new File([blob], nativeFile.name || 'video_from_native.mp4', {
              type: nativeFile.type || (blob.type !== '' ? blob.type : 'application/octet-stream'), // Provide a fallback MIME type
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
          console.error('Invalid video file structure:', currentVideoFile)
          throw new Error('Invalid video file provided for TUS upload.')
        }

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
          chunkSize: Platform.OS === 'web' ? undefined : 5 * 1024 * 1024, // Optional: Set chunk size for native (e.g., 5MB) if needed for stability
          uploadSize: uploadableForTus.size, // Explicitly set uploadSize if available
          onError: async (error) => {
            console.error('Failed to upload to Bunny Stream:', error)
            setFormError(`Upload failed: ${(error as Error).message || 'Unknown TUS error'}`)
            if (convexVideoId) {
              await updateVideoDetailsMutation({ convexVideoId, status: 'failed_upload' })
            }
            setLoading(false)
            setUploadProgress(null)
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            let percentage = 0
            // Ensure bytesTotal is positive to avoid division by zero or NaN
            if (bytesTotal > 0) {
              percentage = (bytesUploaded / bytesTotal) * 100
            } else if (bytesUploaded > 0) {
              // If bytesTotal is not yet known but we are uploading, show some progress (e.g., 1% or based on chunks)
              // This case should ideally be rare with TUS once upload starts
              percentage = 1
            }
            // **MODIFIED: Clamp the percentage between 0 and 100**
            const clampedPercentage = Math.min(Math.max(percentage, 0), 100)
            setUploadProgress(clampedPercentage)
          },
          onSuccess: async () => {
            console.log('Upload successful to Bunny Stream! Video GUID:', bunnyVideoGUID)
            if (convexVideoId) {
              await updateVideoDetailsMutation({
                convexVideoId,
                status: 'processing', // Bunny will now process/transcode
              })
            }
            setFormError(null)
            setLoading(false)
            setUploadProgress(100) // Ensure it ends at 100
            reset(memoizedDefaultValues) // Reset form to initial default values
            setValue('videoFile', undefined) // Explicitly clear the file input field
            alert('Video upload initiated successfully! It will be processed shortly.')
            // Consider navigating or giving more feedback
          },
        })

        upload.start()
      } catch (error: any) {
        console.error('Error in overall upload process:', error)
        setFormError(error.message || 'An unexpected error occurred during the upload process.')
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
      memoizedDefaultValues, // Added memoizedDefaultValues to dependency array for reset
      setValue, // Added setValue
    ]
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '$background' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <FormCard
          padding="$4"
          gap="$5"
          borderWidth={Platform.OS === 'web' ? 1 : 0}
          borderColor="$borderColor"
          borderRadius="$4"
          marginHorizontal={Platform.OS === 'web' ? '$4' : '$0'}
          $gtMd={{ marginHorizontal: '$10' }}
        >
          <Form onSubmit={handleSubmit(onSubmit)} gap="$5">
            <H1 alignSelf="center" size="$8" $xs={{ size: '$7' }} color="$color12">
              Upload New Video
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
              render={({ field }) => {
                if (DEBUG_RENDER) {
                  console.log(`Title Controller render - value: "${field.value}"`)
                }
                return (
                  <InputComponent
                    label="Title*"
                    errorMessage={errors.title?.message}
                    id="video-title"
                  >
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
                )
              }}
            />

            <Controller
              control={control}
              name="description"
              render={({ field }) => {
                if (DEBUG_RENDER) {
                  console.log(`Description Controller render - value: "${field.value}"`)
                }
                return (
                  <InputComponent
                    label="Description (Optional)"
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
                )
              }}
            />

            <Controller
              control={control}
              name="tags"
              render={({ field }) => {
                if (DEBUG_RENDER) {
                  console.log(`Tags Controller render - value: "${field.value}"`)
                }
                return (
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
                )
              }}
            />

            <Controller
              control={control}
              name="visibility"
              render={({ field }) => {
                if (DEBUG_RENDER) {
                  console.log(`Visibility Controller render - value: "${field.value}"`)
                }
                return (
                  <InputComponent
                    label="Visibility"
                    errorMessage={errors.visibility?.message}
                    id="video-visibility"
                  >
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loading}
                      size="$4"
                      native={Platform.OS !== 'web'} // Keep this for native Select behavior
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
                )
              }}
            />

            <Controller
              name="videoFile"
              control={control}
              render={(
                { field: { onChange, value: rhfValue } } // rhfValue for clarity
              ) => (
                <InputComponent
                  label="Video File*"
                  errorMessage={errors.videoFile?.message as string | undefined}
                  id="video-file-upload"
                >
                  <FilePickerComponent
                    onFileSelected={(fileAsset) => {
                      onChange(fileAsset) // Update React Hook Form's state
                    }}
                    disabled={loading}
                    currentFile={rhfValue as VideoFileFieldType | undefined} // Pass current RHF value
                  />
                </InputComponent>
              )}
            />

            {loading && uploadProgress !== null && (
              <YStack gap="$2" ai="center">
                <Text>
                  {uploadProgress === 100 && !formError // Check for formError
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
                theme={loading ? undefined : 'active'}
                disabled={loading}
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
