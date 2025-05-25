// apps/next/app/layout.tsx
import type { Metadata } from 'next'
import { NextTamaguiProvider } from 'app/provider/NextTamaguiProvider'
import { ConvexReactClient } from 'convex/react'
import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProviderWithClerk from '../components/ConvexProviderWithClerk'
import ReplykeProviderWithClerk from '../components/ReplykeProviderWithClerk'
import './globals.css'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

export const metadata: Metadata = {
  title: 'Vidream',
  description: 'Video streaming site',
  icons: '/favicon.svg',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // You can use `suppressHydrationWarning` to avoid the warning about mismatched content during hydration in dev mode

    // <html lang="en">
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <ConvexClientProviderWithClerk>
            <ReplykeProviderWithClerk>
              <NextTamaguiProvider>{children}</NextTamaguiProvider>
            </ReplykeProviderWithClerk>
          </ConvexClientProviderWithClerk>
        </ClerkProvider>
      </body>
    </html>
  )
}
