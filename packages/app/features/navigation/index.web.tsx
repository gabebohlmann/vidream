// packages/app/features/navigation/index.web.tsx
'use client'

import { View, YStack, XStack, useMedia } from '@my/ui'
import { BottomTabNavBar } from './BottomTabNavBar.web'
import type { TabConfig } from '@my/config/src/tabs'
import { TopTabNavBar } from './TopTabNavBar.web'
import { Sidebar } from './Sidebar.web'
import { useState } from 'react' // Import useState

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

  // Handler to activate search mode (e.g., called from BottomTabNavBar)
  const handleActivateSmSearch = () => {
    if (sm) { // Only activate if on small screen
      setIsSmSearchActive(true)
    }
  }

  // Handler for TopTabNavBar to update the search mode (e.g., when its back button is pressed)
  const handleSetSmSearchActive = (active: boolean) => {
    setIsSmSearchActive(active)
  }

  const handleSearchSubmit = (query: string) => {
    console.log('Search Submitted:', query)
    // Implement your search logic here (e.g., navigate to a search results page)
    // Optionally, deactivate search mode after submission
    // setIsSmSearchActive(false);
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
          <View
            flex={1}
            paddingBottom={isSmSearchActive ? 0 : 60} // No padding if search is active (bottom bar might be hidden or less relevant)
                                                     // Or always 60 if bottom bar remains visible
          >
            {children}
          </View>
          {/* Conditionally render BottomTabNavBar or adjust its behavior when search is active */}
          {!isSmSearchActive && ( // Example: Hide BottomTabNavBar when search is active
             <BottomTabNavBar
                tabs={tabsConfig}
                onSearchIconPress={handleActivateSmSearch} // Pass the handler
             />
           )}
           {/* Alternative: Always show BottomTabNavBar but change its state/appearance */}
           {/* <BottomTabNavBar
                tabs={tabsConfig}
                onSearchIconPress={handleActivateSmSearch}
                isSearchActive={isSmSearchActive} // A new prop to let BottomTabNavBar know
           /> */}
        </>
      ) : (
        // --- Larger Screens Layout ---
        <XStack flex={1}>
          <Sidebar />
          <YStack flex={1} maxWidth="100%" $gtSm={{ maxWidth: 'calc(100vw - 72px)' }} $gtMd={{ maxWidth: 'calc(100vw - 240px)' }}>
            <TopTabNavBar
              isScreenSm={false}
              isSearchActiveSm={false} // Search mode is only for SM
              onSetSearchActiveSm={() => {}} // No-op for larger screens
              onSearchSubmit={handleSearchSubmit} // Can still use the same submit logic for larger screen search
            />
            <View
              flex={1}
              padding="$0"
            >
              <YStack fullscreen scrollable_y>
                 <View padding="$4">
                    {children}
                 </View>
              </YStack>
            </View>
          </YStack>
        </XStack>
      )}
    </YStack>
  )
}