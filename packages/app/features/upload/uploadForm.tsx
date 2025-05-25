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
import { api } from '../../../../convex/_generated/api'
import { useRouter } from 'solito/navigation'
import * as tus from 'tus-js-client'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { FilePickerProps, NativeFileAsset } from './types'

const FormCard = YStack

// --- DEBUGGING: Set to true to enable console logs for rendering ---
// !! IMPORTANT: Set this to true to help debug the reset issue !!
const DEBUG_RENDER = false // <--- SET TO true FOR DEBUGGING

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
        <Label htmlFor={id} onLayout={undefined}>
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
    .refine((file) => file.size > 0, 'Video file is required.')
    .refine(
      (file) => file.type.startsWith('video/'),
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
        .refine((s) => s === undefined || s > 0, 'File size is invalid'),
      file: z.any().optional(),
    })
    .refine(
      (file) =>
        (file.type && file.type.startsWith('video/')) ||
        (!file.type && file.name.match(/\.(mp4|mov|avi|mkv|webm|m4v)$/i)),
      'File must be a video.'
    ),
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
  videoFile: videoFileSchemaPart,
})

export type VideoFormData = z.infer<typeof videoSchema>
export type VideoFileFieldType = VideoFormData['videoFile']

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
    }),
    []
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: memoizedDefaultValues,
  })

  const videoFile = watch('videoFile') as VideoFileFieldType | undefined

  const onSubmit = useCallback(
    async (data: VideoFormData) => {
      // ... (onSubmit logic remains the same as previous correct version)
      setLoading(true)
      setFormError(null)
      setUploadProgress(0)

      if (!libraryId) {
        setFormError('Video upload service is not configured (Library ID missing).')
        setLoading(false)
        return
      }
      if (!data.videoFile) {
        setFormError('No video file selected.')
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

        if (Platform.OS === 'web' && data.videoFile instanceof File) {
          uploadableForTus = data.videoFile
          tusMetadata = {
            filetype: data.videoFile.type,
            title: data.title,
            name: data.videoFile.name,
          }
        } else if (Platform.OS !== 'web') {
          const nativeFile = data.videoFile as NativeFileAsset
          if (nativeFile.file instanceof File) {
            uploadableForTus = nativeFile.file
          } else if (nativeFile.uri) {
            const response = await fetch(nativeFile.uri)
            const blob = await response.blob()
            uploadableForTus = new File([blob], nativeFile.name || 'video.mp4', {
              type: nativeFile.type || (blob.type !== '' ? blob.type : 'video/mp4'),
            })
          } else {
            throw new Error('Unsupported native file structure for TUS upload.')
          }
          tusMetadata = {
            filetype: uploadableForTus.type,
            title: data.title,
            name: uploadableForTus.name,
          }
        } else {
          throw new Error('Invalid video file provided.')
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
          onError: async (error) => {
            console.error('Failed to upload to Bunny Stream:', error)
            setFormError(`Upload failed: ${(error as Error).message || 'Unknown error'}`)
            if (convexVideoId) {
              await updateVideoDetailsMutation({ convexVideoId, status: 'failed_upload' })
            }
            setLoading(false)
            setUploadProgress(null)
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const percentage = (bytesUploaded / bytesTotal) * 100
            setUploadProgress(percentage)
          },
          onSuccess: async () => {
            console.log('Upload successful to Bunny Stream! Video GUID:', bunnyVideoGUID)
            if (convexVideoId) {
              await updateVideoDetailsMutation({
                convexVideoId,
                status: 'processing',
              })
            }
            setFormError(null)
            setLoading(false)
            setUploadProgress(100)
            reset()
            alert('Video upload initiated successfully! It will be processed shortly.')
          },
        })

        upload.start()
      } catch (error: any) {
        console.error('Error in upload process:', error)
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

            {/* Title Field (Should be working) */}
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
                      {...field} // Spread first
                      value={field.value ?? ''} // Then explicitly set value
                      onChangeText={field.onChange} // Explicitly map RHF's onChange to onChangeText
                      onBlur={field.onBlur} // Explicitly map RHF's onBlur
                      placeholder="Enter video title"
                      disabled={loading}
                      size="$4"
                    />
                  </InputComponent>
                )
              }}
            />

            {/* Description Field (TextArea) */}
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
                      {...field} // Spread first
                      value={field.value ?? ''} // Then explicitly set value
                      onChangeText={field.onChange} // Explicitly map RHF's onChange to onChangeText
                      onBlur={field.onBlur} // Explicitly map RHF's onBlur
                      placeholder="Tell viewers about your video"
                      disabled={loading}
                      size="$4"
                      minHeight={100}
                    />
                  </InputComponent>
                )
              }}
            />

            {/* Tags Field (TamaguiInput) */}
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
                      {...field} // Spread first
                      value={field.value ?? ''} // Then explicitly set value
                      onChangeText={field.onChange} // Explicitly map RHF's onChange to onChangeText
                      onBlur={field.onBlur} // Explicitly map RHF's onBlur
                      placeholder="e.g., gaming, tutorial, vlog"
                      disabled={loading}
                      size="$4"
                    />
                  </InputComponent>
                )
              }}
            />

            {/* Visibility Field (Select) */}
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
                      // {...field} // Spreading field here might be okay, but onValueChange is more specific
                      value={field.value} // Explicitly set value
                      onValueChange={field.onChange} // RHF's onChange handles the value update
                      // onBlur={field.onBlur} // Select might not have a standard onBlur, or RHF handles it via onValueChange
                      disabled={loading}
                      size="$4"
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
                )
              }}
            />

            {/* File Picker (Assumed to be working correctly with RHF's onChange) */}
            <Controller
              name="videoFile"
              control={control}
              render={({ field: { onChange, value } }) => (
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
                    currentFile={value as VideoFileFieldType | undefined}
                  />
                </InputComponent>
              )}
            />

            {/* Loading and Submit Button (remains the same) */}
            {loading && uploadProgress !== null && (
              <YStack gap="$2" ai="center">
                <Text>
                  {uploadProgress === 100
                    ? 'Finalizing...'
                    : `Uploading: ${uploadProgress.toFixed(0)}%`}
                </Text>
                <View
                  width="100%"
                  height={10}
                  backgroundColor="$color5"
                  borderRadius="$2"
                  overflow="hidden"
                >
                  <View width={`${uploadProgress}%`} height="100%" backgroundColor="$blue10" />
                </View>
              </YStack>
            )}

            <Form.Trigger asChild disabled={loading}>
              <Button
                icon={loading ? <Spinner /> : UploadCloud}
                theme={loading ? undefined : 'active'}
                disabled={loading}
              >
                {loading
                  ? uploadProgress === null
                    ? 'Preparing...'
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
