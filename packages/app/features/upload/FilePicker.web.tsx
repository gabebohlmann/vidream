// packages/app/features/upload/FilePicker.web.tsx
import React from 'react';
import { Button, Text } from '@my/ui'; // Or your Tamagui Button
import { UploadCloud } from '@tamagui/lucide-icons';
import type { FilePickerProps } from './types'; // Adjust path

export function WebFilePicker({ onFileSelected, disabled, currentFile }: FilePickerProps) {
  const handlePress = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement)?.files?.[0];
      if (file) {
        onFileSelected(file);
      }
    };
    input.click();
  };

  const file = currentFile as File | undefined;

  return (
    <>
      <Button
        icon={UploadCloud}
        onPress={handlePress}
        disabled={disabled}
        theme={file ? "green" : "gray"}
      >
        {file ? `Selected: ${file.name}` : "Choose Video File (Web)"}
      </Button>
      {/* Optionally display error if needed, though RHF handles it outside */}
    </>
  );
}