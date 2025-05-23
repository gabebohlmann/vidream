// packages/app/features/navigation/index.web.tsx
'use client'

import { View, YStack, XStack, useMedia } from '@my/ui'
import { BottomTabNavBar } from './BottomTabNavBar.web'
import type { TabConfig } from '@my/config/src/tabs'
import { TopTabNavBar } from './TopTabNavBar.web'
import { Sidebar } from './Sidebar.web'
import { useState, useEffect } from 'react' // Import useEffect
import { usePathname } from 'solito/navigation' // Import usePathname here

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
  const pathname = usePathname() // Get current pathname here
  const [isSmSearchActive, setIsSmSearchActive] = useState(false)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [targetHrefAfterSearchExit, setTargetHrefAfterSearchExit] = useState<string | null>(null)

  const handleActivateSmSearch = () => {
    if (sm) {
      setIsSmSearchActive(true)
      setTargetHrefAfterSearchExit(null) // Clear any previous target when activating search
    }
  }

  const handleSetSmSearchActive = (active: boolean, targetHref: string | null = null) => {
    setIsSmSearchActive(active)
    if (!active && targetHref) {
      setTargetHrefAfterSearchExit(targetHref)
    } else if (active) {
      // When search becomes active (or is re-confirmed active)
      setTargetHrefAfterSearchExit(null)
    }
    // If search is being deactivated without a specific target (e.g. back button in TopNav)
    // targetHref will be null, and targetHrefAfterSearchExit will remain null.
  }

  // Clear targetHrefAfterSearchExit once navigation is complete
  useEffect(() => {
    if (targetHrefAfterSearchExit && pathname === targetHrefAfterSearchExit) {
      setTargetHrefAfterSearchExit(null)
    }
  }, [pathname, targetHrefAfterSearchExit])

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
            onSetSearchActiveSm={handleSetSmSearchActive} // Pass the modified handler
            onSearchSubmit={handleSearchSubmit}
          />
          <View flex={1} paddingBottom={60}>
            {children}
          </View>
          <BottomTabNavBar
            tabs={tabsConfig}
            onSearchIconPress={handleActivateSmSearch}
            onSetSearchActiveSm={handleSetSmSearchActive} // Pass the modified handler
            isSearchModeActive={isSmSearchActive}
            targetHrefDuringTransition={targetHrefAfterSearchExit} // Pass the new target state
          />
        </>
      ) : (
        // --- Larger Screens Layout ---
        <YStack flex={1} fullscreen>
          <TopTabNavBar
            isScreenSm={false}
            isSearchActiveSm={false}
            onSetSearchActiveSm={() => {}}
            onSearchSubmit={handleSearchSubmit}
            onToggleSidebarExpand={handleToggleSidebarExpand}
          />
          <XStack flex={1} position="relative">
            <Sidebar isExpanded={isSidebarExpanded} />
            <View flex={1} position="relative">
              <YStack fullscreen scrollable_y     >
                <View padding="$4">{children}</View>
              </YStack>
            </View>
          </XStack>
        </YStack>
      )}
    </YStack>
  )
}
