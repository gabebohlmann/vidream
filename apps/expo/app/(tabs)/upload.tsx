// apps/expo/app/(tabs)/upload.tsx
import UploadVideoFormNative from 'app/features/upload/form.native'
import { SafeAreaView } from 'react-native-safe-area-context' // Using this directly for top level
import { View, Text, YStack } from '@my/ui' // Assuming YStack is available for easy flex column
import { useEffect } from 'react'

export default function UploadVideoPage() {
  const libraryId = process.env.EXPO_PUBLIC_BUNNY_STREAM_LIBRARY_ID

  useEffect(() => {
    if (!libraryId) {
      console.warn(
        'EXPO_PUBLIC_BUNNY_STREAM_LIBRARY_ID is not defined. Upload form might not work correctly.'
      )
    }
  }, [libraryId])

  if (!libraryId) {
    // Render a placeholder or error if libraryId is crucial and missing
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <YStack gap="$2" padding="$4" alignItems="center">
          <Text color="$red10" fontWeight="bold">
            Error
          </Text>
          <Text textAlign="center">
            Video upload service is not properly configured
          </Text>
        </YStack>
      </SafeAreaView>
    )
  }

  return (
    // Option 1: Use SafeAreaView directly from react-native-safe-area-context
    // and ensure it fills the screen. The UploadVideoForm already has a SafeAreaView,
    // so you might not need another one here if UploadVideoForm is meant to be the full screen.
    <SafeAreaView style={{ flex: 1, paddingHorizontal: '10', marginTop: '-30' }}>
      <UploadVideoFormNative libraryId={libraryId as string} />
    </SafeAreaView>
  )
}
