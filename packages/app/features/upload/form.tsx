// packages/app/features/upload/form.tsx
'use client'
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
  ScrollView, // Import ScrollView if not already
} from '@my/ui'
import { Info, UploadCloud } from '@tamagui/lucide-icons'
// Assuming FormCard is a shared component, adjust path if necessary
// import { FormCard } from 'app/features/auth/components/layoutParts';
// Using YStack as a FormCard substitute for this example
const FormCard = YStack

import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { SafeAreaView } from 'react-native'
import { useState, useCallback } from 'react'
import { useMutation, useAction } from 'convex/react' // Import useAction
import { api } from '../../../../convex/_generated/api' // Ensure this path is correct
import { useRouter } from 'solito/navigation'
import * as tus from 'tus-js-client'
import type { Id } from '../../../../convex/_generated/dataModel'

const InputComponent = ({
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
} & YStack['props']) => (
  <YStack gap="$2" {...rest}>
    {/* <Label htmlFor={id}Unmz={undefined} onLayout={undefined}> */}
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

const videoSchema = z.object({
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
  videoFile: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'Video file is required.')
    .refine((file) => file.type.startsWith('video/'), 'File must be a video.'),
  // thumbnailFile: z.instanceof(File).optional(), // Add back if you implement manual thumbnail uploads
})

type VideoFormData = z.infer<typeof videoSchema>

const BUNNY_TUS_ENDPOINT = 'https://video.bunnycdn.com/tusupload'

export default function UploadVideoForm(libraryId: string) {
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const router = useRouter()
  const createVideoMetadataMutation = useMutation(api.videos.createVideoMetadata)
  const generateBunnyCredentialsAction = useAction(api.bunnyActions.generateBunnyUploadCredentials) // CORRECTED
  const updateVideoDetailsMutation = useMutation(api.videos.updateVideoDetails)

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      visibility: 'public',
      videoFile: undefined,
    },
  })

  const videoFile = watch('videoFile')

  const onSubmit = async (data: VideoFormData) => {
    setLoading(true)
    setFormError(null)
    setUploadProgress(0)

    if (!libraryId) {
      console.error(
        'Bunny Stream Library ID is not configured (libraryId).'
      )
      setFormError('Video upload service is not configured. Please contact support.')
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
      // 1. Create video metadata in Convex
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

      // 2. Get pre-signed URL and other credentials from Bunny Stream via Convex action
      const bunnyUploadData = await generateBunnyCredentialsAction({
        // CORRECTED
        title: data.title,
        collectionId: undefined, // Pass undefined if not using collections, or an actual ID
        convexVideoId: convexVideoId, // Pass the ID from Convex
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
      const { bunnyVideoGUID, signature, expires, libraryId } = bunnyUploadData

      // Update status to "uploading"
      await updateVideoDetailsMutation({ convexVideoId, status: 'uploading' })

      // 3. Upload to Bunny Stream using TUS
      const upload = new tus.Upload(data.videoFile, {
        endpoint: BUNNY_TUS_ENDPOINT,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: expires.toString(),
          VideoId: bunnyVideoGUID,
          LibraryId: libraryId, // Use libraryId from action response
        },
        metadata: {
          filetype: data.videoFile.type,
          title: data.title,
          // collection: "your_collection_id", // Optional
        },
        onError: async (error) => {
          console.error('Failed to upload to Bunny Stream:', error)
          setFormError(`Upload failed: ${error.message || 'Unknown error'}`)
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
            // Status could be "processing" if Bunny needs to transcode,
            // or "finished" if direct play or if webhooks will update later.
            // For now, assume "processing" until a webhook confirms.
            await updateVideoDetailsMutation({
              convexVideoId,
              status: 'processing', // Or "finished" if no further server-side processing by Bunny
              // You might get a direct playback URL or thumbnail from Bunny's "Create Video" response
              // or wait for a webhook after processing is complete.
            })
          }
          setFormError(null)
          setLoading(false)
          setUploadProgress(100)
          reset() // Reset the form
          alert('Video upload initiated successfully! It will be processed shortly.')
          // router.push('/'); // Or to the video's page, or a "my videos" page
        },
      })

      upload.start()
    } catch (error: any) {
      console.error('Error in upload process:', error)
      setFormError(error.message || 'An unexpected error occurred during the upload process.')
      if (
        convexVideoId &&
        !(error.data?.type === 'ConvexError' && error.data.code === 'ObjectIsMissingRequiredField')
      ) {
        // Avoid double update if validation failed before this
        try {
          await updateVideoDetailsMutation({ convexVideoId, status: 'failed_upload' })
        } catch (updateError) {
          console.error('Failed to update video status to failed_upload', updateError)
        }
      }
      setLoading(false)
      setUploadProgress(null)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '$background' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <FormCard
          gap="$5"
          paddingHorizontal="$4"
          paddingVertical="$6"
          marginHorizontal="auto"
          maxWidth={600}
          width="100%"
          $sm={{
            paddingHorizontal: '$3',
            paddingVertical: '$4',
          }}
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
              render={({ field }) => (
                <InputComponent label="Title" errorMessage={errors.title?.message} id="video-title">
                  <TamaguiInput
                    {...(errors.title && { theme: 'red' })}
                    placeholder="Enter video title"
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
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
                  label="Description (Optional)"
                  errorMessage={errors.description?.message}
                  id="video-description"
                >
                  <TextArea
                    placeholder="Tell viewers about your video"
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
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
                    placeholder="e.g., gaming, tutorial, vlog"
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
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
                    size="$4"
                    native={false}
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
                        <Sheet.Overlay />
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
              render={({ field: { onChange, value, ...fieldProps } }) => (
                <InputComponent
                  label="Video File"
                  errorMessage={errors.videoFile?.message as string | undefined}
                  id="video-file-upload"
                >
                  <Button
                    icon={UploadCloud}
                    onPress={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'video/*' // Accept any video type
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement)?.files?.[0]
                        if (file) {
                          onChange(file) // RHF's onChange
                        }
                      }
                      input.click()
                    }}
                    disabled={loading}
                    theme={videoFile ? 'green' : 'gray'}
                  >
                    {videoFile ? `Selected: ${videoFile.name}` : 'Choose Video File'}
                  </Button>
                  {errors.videoFile && (
                    <Text color="$red10" fontSize="$2">
                      {errors.videoFile?.message as string}
                    </Text>
                  )}
                </InputComponent>
              )}
            />

            {loading && uploadProgress !== null && (
              <YStack gap="$2" ai="center">
                <Text>Uploading: {uploadProgress.toFixed(0)}%</Text>
                {/* Basic progress bar */}
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

            <Form.Trigger asChild>
              <Button
                themeInverse
                disabled={loading}
                cursor={loading ? 'progress' : 'pointer'}
                iconAfter={
                  loading && uploadProgress === null ? (
                    <Spinner size="small" color="$color" />
                  ) : undefined
                }
              >
                {loading && uploadProgress === null ? 'Preparing...' : 'Upload Video'}
              </Button>
            </Form.Trigger>
          </Form>
        </FormCard>
      </ScrollView>
    </SafeAreaView>
  )
}
