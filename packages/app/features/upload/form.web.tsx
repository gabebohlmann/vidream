// packages/app/features/upload/form.web.tsx
'use client'
import { CoreUploadVideoForm } from './uploadForm.web' // The core logic
import { WebFilePicker } from './FilePicker.web' // Web-specific picker

interface UploadVideoFormWebProps {
  libraryId: string
}

export default function UploadVideoFormWeb({ libraryId }: UploadVideoFormWebProps) {
  return <CoreUploadVideoForm libraryId={libraryId} FilePickerComponent={WebFilePicker} />
}
