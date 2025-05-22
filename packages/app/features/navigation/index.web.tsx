// packages/app/features/navigation/index.web.tsx
'use client'

import { View, YStack, XStack, useMedia } from '@my/ui'
import { BottomTabNavBar } from './BottomTabNavBar.web'
import type { TabConfig } from '@my/config/src/tabs'
import { TopTabNavBar } from './TopTabNavBar.web'
import { Sidebar } from './Sidebar.web' // Ensure this path is correct
import { useState } from 'react'

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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false) // State for sidebar

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
    // Implement your search logic here
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
            // No need for isSidebarExpanded on SM screens for this specific logo issue
          />
          <View flex={1} paddingBottom={isSmSearchActive ? 0 : 60}>
            {children}
          </View>
          {!isSmSearchActive && (
            <BottomTabNavBar tabs={tabsConfig} onSearchIconPress={handleActivateSmSearch} />
          )}
        </>
      ) : (
        // --- Larger Screens Layout ---
        <XStack flex={1}>
          <Sidebar isExpanded={isSidebarExpanded} onToggleExpand={handleToggleSidebarExpand} />
          <YStack
            flex={1}
            maxWidth="100%"
            $gtSm={{ maxWidth: `calc(100vw - ${isSidebarExpanded ? 240 : 96}px)` }}
          >
            {' '}
            {/* Dynamic maxWidth */}
            <TopTabNavBar
              isScreenSm={false}
              isSearchActiveSm={false}
              onSetSearchActiveSm={() => {}}
              onSearchSubmit={handleSearchSubmit}
              isSidebarExpanded={isSidebarExpanded} // Pass sidebar state
            />
            <View flex={1} padding="$0">
              <YStack fullscreen scrollable_y>
                <View padding="$4">{children}</View>
              </YStack>
            </View>
          </YStack>
        </XStack>
      )}
    </YStack>
  )
}
