// apps/next/app/(main)/upload/page.tsx
import { EntityListProvider } from '@replyke/react-js'
import UploadVideoFormWeb from 'app/features/upload/form.web'

export default function UploadVideoPage() {
  const libraryId = process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID
  return (
    <EntityListProvider sourceId="videos">
      <UploadVideoFormWeb libraryId={libraryId as string} />
    </EntityListProvider>
  )
}
