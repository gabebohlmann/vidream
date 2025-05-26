// packages/app/features/upload/form.native.tsx
import { CoreUploadVideoForm } from './uploadForm.web' // The core logic
import { NativeFilePicker } from './FilePicker.native' // Native-specific picker

interface UploadVideoFormNativeProps {
  libraryId: string
}

export default function UploadVideoFormNative({ libraryId }: UploadVideoFormNativeProps) {
  return <CoreUploadVideoForm libraryId={libraryId} FilePickerComponent={NativeFilePicker} />
}
