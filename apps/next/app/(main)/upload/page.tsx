// apps/next/app/(main)/upload/page.tsx
import UploadVideoForm from 'app/features/upload/form'


export default function UploadVideoPage() {
  const libraryId = process.env.NEXT_PUBLIC_LIBRARY_ID
  return (
    <UploadVideoForm libraryId={libraryId as string} />
  )
}