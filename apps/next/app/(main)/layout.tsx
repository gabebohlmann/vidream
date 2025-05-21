// apps/next/app/(main)/layout.tsx
'use client'
import type { Metadata } from 'next'
import NavBarDrawer from '@my/ui/src/components/NavBarDrawer'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

// export const metadata: Metadata = {
//   title: 'Tamagui • App Router',
//   description: 'Tamagui, Solito, Expo & Next.js',
//   icons: '/favicon.ico',
// }

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBarDrawer />
      {children}
    </>
  )
}
