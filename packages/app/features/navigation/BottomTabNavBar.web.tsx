// packages/app/features/navigation/BottomTabNavBar.web.tsx
'use client'

import { Button, Text, XStack, YStack, useMedia } from 'tamagui'
import { useRouter, usePathname } from 'solito/navigation'
import type { TabConfig } from '@my/config/src/tabs' // Assuming TabConfig has name, href, icon, label

interface CustomBottomTabBarProps {
  tabs: TabConfig[];
  onSearchIconPress?: () => void; // New prop to trigger SM search mode in parent
  // isSearchActive?: boolean; // Optional: if you want to visually change the search tab when active
}

export function BottomTabNavBar({ tabs, onSearchIconPress /*, isSearchActive */ }: CustomBottomTabBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { sm } = useMedia()

  if (!sm) {
    // On larger screens, this component might not render or render differently.
    // The provided code doesn't explicitly return null if !sm,
    // but the parent WebNavigationLayout handles this.
    // If it were to render on !sm, the search functionality here wouldn't apply.
  }

  const handleTabPress = (tab: TabConfig) => {
    // Check if this is the search tab and if the onSearchIconPress handler exists
    // You'll need a way to identify your search tab. Common ways:
    // 1. By a specific name (e.g., 'Search', 'search')
    // 2. By a unique href (e.g., '/search-trigger')
    // 3. By an explicit property in TabConfig (e.g., isSearchTrigger: true)

    // Using name for identification (case-insensitive)
    const isSearchTab = tab.name.toLowerCase() === 'search'; // Adjust if your search tab has a different name

    if (isSearchTab && onSearchIconPress) {
      onSearchIconPress();
      // Decide if you still want to navigate for the search tab.
      // Often, a search tab in the bottom bar that activates a top-bar search
      // might not navigate immediately, or navigates to a screen that also shows the search.
      // If it has a dedicated route like '/search', you might still want to push it.
      // router.push(tab.href);
    } else {
      router.push(tab.href);
    }
  }

  return (
    <XStack
      height={60}
      borderTopWidth={1}
      borderTopColor="$borderColor"
      backgroundColor="$background"
      alignItems="center"
      justifyContent="space-around"
      bottom={0}
      left={0}
      right={0}
      width="100%"
      zIndex={10} // Ensure it's above content but below modals if any
    >
      {tabs.map((tab) => {
        let isActive;
        // A common pattern for home tab exact match, and startsWith for others.
        if (tab.href === '/app/home' || tab.href === '/') { // Adjust your home path
          isActive = pathname === tab.href;
        } else {
          isActive = pathname?.startsWith(tab.href);
        }

        // If this is the search tab, and search mode is active, you might want a different active state.
        // For example, if `isSearchActive` prop was passed:
        // const isSearchButtonActive = tab.name.toLowerCase() === 'search' && isSearchActive;
        // const displayActive = isSearchButtonActive || isActive;
        const displayActive = isActive; // Current logic

        return (
          <Button
            key={tab.name}
            flexGrow={1}
            flexBasis={0}
            flexShrink={1}
            chromeless
            onPress={() => handleTabPress(tab)} // Updated to pass the whole tab object
            paddingVertical="$2"
            pressStyle={{ backgroundColor: '$backgroundHover' }}
            minWidth={0}
            paddingHorizontal="$0"
            marginHorizontal={4} // Small margin between buttons
            // Example: visually change if search is active globally
            // opacity={isSearchActive && !(tab.name.toLowerCase() === 'search') ? 0.5 : 1}
            // disabled={isSearchActive && !(tab.name.toLowerCase() === 'search')}
          >
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              gap="$1"
              paddingHorizontal="$1"
            >
              <tab.icon
                color={displayActive ? '#138404' : '$color'} // Your active color
                size={20}
              />
              <Text
                fontSize={10}
                color={displayActive ? '#138404' : '$color'} // Your active color
                fontWeight={displayActive ? "bold" : "normal"} // Make active bold
                textAlign="center"
              >
                {tab.label}
              </Text>
            </YStack>
          </Button>
        )
      })}
    </XStack>
  )
}