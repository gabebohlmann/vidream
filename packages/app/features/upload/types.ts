// packages/app/features/upload/types.ts
export interface FilePickerProps {
  onFileSelected: (file: File | NativeFileAsset) => void;
  disabled?: boolean;
  currentFile: File | NativeFileAsset | null | undefined;
}

export interface NativeFileAsset { // Structure from expo-document-picker or expo-image-picker
  uri: string;
  name: string;
  type?: string; // Mime type
  size?: number;
  lastModified?: number;
  file?: File; // expo-document-picker might include the actual File object on some platforms
}