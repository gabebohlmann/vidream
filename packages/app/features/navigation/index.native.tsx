// packages/app/features/navigation/index.native.tsx
'use client'

import { View, YStack, useMedia } from '@my/ui'
import { BottomTabNavBar } from './BottomTabNavBar'
import type { TabConfig } from '@my/config/src/tabs' // Import the type
import { TopTabNavBar } from './TopTabNavBar' // Adjust path as needed

interface NativeNavigationLayoutProps {
  children: React.ReactNode
  isSignedIn?: boolean
  showTopBar?: boolean
  tabsConfig: TabConfig[] // Expect tabsConfig as a prop
  // title?: string; // If MyCustomTopBar needed a dynamic title from layout
}

export function NativeNavigationLayout({
  children,
  isSignedIn,
  showTopBar = true,
  tabsConfig, // Use the passed-in prop
  // title
}: NativeNavigationLayoutProps) {
  const { sm } = useMedia()

  return (
    <YStack flex={1} backgroundColor="$background">
      <TopTabNavBar isSignedIn={isSignedIn} /* title={title} */ />
      {children}
    </YStack>
  )
}
