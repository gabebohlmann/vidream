// apps/next/app/page.tsx
'use client'

// import { HomeScreen } from 'app/features/home/screen'
import { Link } from 'solito/link'

// export default HomeScreen
export default function HomePage() {
  return (
    <>
      <Link href="/sign-in">Sign In</Link>
    </>
  )
}
