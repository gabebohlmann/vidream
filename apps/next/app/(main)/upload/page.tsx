// apps/next/app/(main)/upload/page.tsx
import UploadVideoFormWeb from 'app/features/upload/form.web'


export default function UploadVideoPage() {
  const libraryId = process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID
  return (
    <UploadVideoFormWeb libraryId={libraryId as string} />
  )
}