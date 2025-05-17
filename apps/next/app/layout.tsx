// apps/next/app/layout.tsx
import type { Metadata } from 'next'
import { NextTamaguiProvider } from 'app/provider/NextTamaguiProvider'
import { ConvexReactClient } from 'convex/react'
import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProviderWithClerk from '../components/ConvexProviderWithClerk'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

export const metadata: Metadata = {
  title: 'Tamagui • App Router',
  description: 'Tamagui, Solito, Expo & Next.js',
  icons: '/favicon.ico',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // You can use `suppressHydrationWarning` to avoid the warning about mismatched content during hydration in dev mode
    // <html lang="en" suppressHydrationWarning>
    <html lang="en">
      <body>
        <ClerkProvider>
          <ConvexClientProviderWithClerk>
            <NextTamaguiProvider>{children}</NextTamaguiProvider>
          </ConvexClientProviderWithClerk>
        </ClerkProvider>
      </body>
    </html>
  )
}
