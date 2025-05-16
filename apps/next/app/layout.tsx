// apps/next/app/layout.tsx
import type { Metadata } from 'next'
import { NextTamaguiProvider } from 'app/provider/NextTamaguiProvider'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ClerkProvider, useAuth } from '@clerk/nextjs'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)

export const metadata: Metadata = {
  title: 'Tamagui • App Router',
  description: 'Tamagui, Solito, Expo & Next.js',
  icons: '/favicon.ico',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // You can use `suppressHydrationWarning` to avoid the warning about mismatched content during hydration in dev mode
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <NextTamaguiProvider>{children}</NextTamaguiProvider>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </body>
    </html>
  )
}
