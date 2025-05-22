// apps/next/app/(main)/layout.tsx
'use client'

import { WebNavigationLayout } from 'app/features/navigation/index.web'
import { useAuth } from '@clerk/nextjs'
import type { TabConfig } from '@my/config/src/tabs'
import { Home, Film, TvMinimalPlay, CircleUserRound, Search} from '@tamagui/lucide-icons'
import { useEffect } from 'react'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

// Define the tab configuration specific to this app segment
const appLayoutTabs: TabConfig[] = [
  { name: 'home', label: 'Home', href: '/home', icon: Home },
  { name: 'flashes', label: 'Flashes', href: '/flashes', icon: Film },
  { name: 'search', label: 'Search', href: '/search', icon: Search },
  { name: 'subscriptions', label: 'Subscriptions', href: '/subscriptions', icon: TvMinimalPlay },
  { name: 'account', label: 'Account', href: '/account', icon: CircleUserRound },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth()

  return (
    <WebNavigationLayout
      isSignedIn={isSignedIn}
      showTopBar={true}
      tabsConfig={appLayoutTabs}
    >
      {children}
    </WebNavigationLayout>
  )
}
