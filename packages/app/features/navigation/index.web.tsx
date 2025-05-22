// packages/app/features/navigation/index.web.tsx
'use client'

import { View, YStack, useMedia } from '@my/ui'
import { BottomTabNavBar } from './BottomTabNavBar'
import type { TabConfig } from '@my/config/src/tabs' // Import the type
import { TopTabNavBar } from './TopTabNavBar' // Adjust path as needed

interface WebNavigationLayoutProps {
  children: React.ReactNode
  isSignedIn?: boolean
  showTopBar?: boolean
  tabsConfig: TabConfig[] // Expect tabsConfig as a prop
  // title?: string; // If MyCustomTopBar needed a dynamic title from layout
}

export function WebNavigationLayout({
  children,
  isSignedIn,
  showTopBar = true,
  tabsConfig, // Use the passed-in prop
  // title
}: WebNavigationLayoutProps) {
  const { sm } = useMedia()

  return (
    <YStack flex={1} backgroundColor="$background">
      <TopTabNavBar isSignedIn={isSignedIn} /* title={title} */ />

      <View
        flex={1}
        // Add paddingBottom to prevent content from being hidden by the fixed bottom tab bar
        // This padding should be equal to the height of the BottomTabNavBar (e.g., 60px)
        paddingBottom={sm ? 60 : 0} // Only apply padding on sm screens where tab bar is visible
      >
        {children}
      </View>

      {/* Render bottom tab bar only on small screens, passing the tabsConfig prop */}
      {sm && <BottomTabNavBar tabs={tabsConfig} />}
    </YStack>
  )
}
