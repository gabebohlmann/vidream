// packages/app/features/upload/FilePicker.native.tsx
import React from 'react'
import { Button, Text } from '@my/ui' // Or your Tamagui Button
import { UploadCloud } from '@tamagui/lucide-icons'
import * as DocumentPicker from 'expo-document-picker'
import type { FilePickerProps, NativeFileAsset } from './types' // Adjust path

export function NativeFilePicker({ onFileSelected, disabled, currentFile }: FilePickerProps) {
  const pickVideoNative = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true, // <--- MODIFIED: Changed to true
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        console.log('[NativeFilePicker] Picked asset:', JSON.stringify(asset, null, 2)) // For debugging the URI

        const nativeAsset: NativeFileAsset = {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType,
          size: asset.size,
          // On native, asset.file is usually undefined even if docs hint at it for web.
          // The File object will be created from the URI in CoreUploadVideoForm.
          file: undefined, // Explicitly undefined or remove if type doesn't expect it unless it's a File
        }
        onFileSelected(nativeAsset)
      }
    } catch (error) {
      console.error('Error picking video on native:', error)
    }
  }

  const file = currentFile as NativeFileAsset | undefined

  return (
    <>
      <Button
        icon={UploadCloud}
        onPress={pickVideoNative}
        disabled={disabled}
        theme={file ? 'green' : 'gray'}
      >
        {file ? `Selected: ${file.name}` : 'Choose Video File'}
      </Button>
      {/* {file && file.uri && (
        <Text fontSize="$2" color="$gray10" mt="$2">
          URI: {file.uri.substring(0, 70)}...
        </Text>
      )} */}
    </>
  )
}
