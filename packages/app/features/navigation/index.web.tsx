// packages/app/features/navigation/index.web.tsx
'use client'

import { View, YStack, XStack, useMedia } from '@my/ui'
import { BottomTabNavBar } from './BottomTabNavBar.web'
import type { TabConfig } from '@my/config/src/tabs'
import { TopTabNavBar } from './TopTabNavBar.web'
import { Sidebar } from './Sidebar.web'
import { useState } from 'react'

// Define a constant for TopTabNavBar height if it's fixed, e.g., 60px
// This can be useful for calculations if needed, though flexbox might handle most of it.
// const TOP_NAV_BAR_HEIGHT = 60;

interface WebNavigationLayoutProps {
  children: React.ReactNode
  isSignedIn?: boolean
  tabsConfig: TabConfig[]
}

export function WebNavigationLayout({
  children,
  isSignedIn,
  tabsConfig,
}: WebNavigationLayoutProps) {
  const { sm } = useMedia()
  const [isSmSearchActive, setIsSmSearchActive] = useState(false)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false) // Default to collapsed

  const handleActivateSmSearch = () => {
    if (sm) {
      setIsSmSearchActive(true)
    }
  }

  const handleSetSmSearchActive = (active: boolean) => {
    setIsSmSearchActive(active)
  }

  const handleToggleSidebarExpand = () => {
    setIsSidebarExpanded((prev) => !prev)
  }

  const handleSearchSubmit = (query: string) => {
    console.log('Search Submitted:', query)
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      {sm ? (
        // --- Small Screens Layout ---
        <>
          <TopTabNavBar
            isScreenSm={true}
            isSearchActiveSm={isSmSearchActive}
            onSetSearchActiveSm={handleSetSmSearchActive}
            onSearchSubmit={handleSearchSubmit}
          />
          <View flex={1} paddingBottom={isSmSearchActive ? 0 : 60}>
            {children}
          </View>
          {!isSmSearchActive && (
            <BottomTabNavBar tabs={tabsConfig} onSearchIconPress={handleActivateSmSearch} />
          )}
        </>
      ) : (
        // --- Larger Screens Layout (Corrected Structure) ---
        <YStack flex={1} fullscreen>
          {/* Main container for !sm */}
          <TopTabNavBar /* This TopTabNavBar is always full width at the top */
            isScreenSm={false}
            isSearchActiveSm={false} // Search mode is only for SM
            onSetSearchActiveSm={() => {}} // No-op for larger screens
            onSearchSubmit={handleSearchSubmit}
            onToggleSidebarExpand={handleToggleSidebarExpand}
          />
          <XStack flex={1} position="relative">
            {/* Row for Sidebar and Content Area below TopNav */}
            <Sidebar
              isExpanded={isSidebarExpanded}
              // No topBarHeight prop needed if using flexbox correctly
            />
            {/* Main Content Area to the right of the Sidebar */}
            <View flex={1} position="relative">
              {/* flex={1} makes it take remaining width */}
              <YStack fullscreen scrollable_y>
                {/* Content itself is scrollable */}
                <View padding="$4">{children}</View>
              </YStack>
            </View>
          </XStack>
        </YStack>
      )}
    </YStack>
  )
}
