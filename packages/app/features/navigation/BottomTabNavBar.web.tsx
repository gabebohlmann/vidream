// packages/app/features/navigation/BottomTabNavBar.web.tsx
'use client'

import { Button, Text, XStack, YStack, useMedia } from 'tamagui'
import { useRouter, usePathname } from 'solito/navigation'
import type { TabConfig } from '@my/config/src/tabs'

interface CustomBottomTabBarProps {
  tabs: TabConfig[]
  onSearchIconPress?: () => void
  onSetSearchActiveSm?: (active: boolean, targetHref?: string | null) => void // Modified signature
  isSearchModeActive?: boolean
  targetHrefDuringTransition?: string | null // New prop
}

export function BottomTabNavBar({
  tabs,
  onSearchIconPress,
  onSetSearchActiveSm,
  isSearchModeActive,
  targetHrefDuringTransition, // Destructure new prop
}: CustomBottomTabBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { sm } = useMedia()

  if (!sm) {
    // return null;
  }

  const handleTabPress = (tab: TabConfig) => {
    const isThisTheSearchTab = tab.name.toLowerCase() === 'search'

    if (isThisTheSearchTab) {
      if (onSearchIconPress) {
        onSearchIconPress() // Activates search mode
      }
      // if (tab.href) router.push(tab.href); // Optional
    } else {
      // If it's any other tab, navigate to it
      if (tab.href) {
        router.push(tab.href)
      }
      // AND deactivate search mode, passing the target href
      if (onSetSearchActiveSm) {
        onSetSearchActiveSm(false, tab.href) // Pass tab.href as the target
      }
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
      zIndex={10}
    >
      {tabs.map((tab) => {
        let pathIsActive
        if (tab.href === '/app/home' || tab.href === '/') {
          pathIsActive = pathname === tab.href
        } else {
          pathIsActive = tab.href && pathname?.startsWith(tab.href)
        }

        const isThisTheSearchTab = tab.name.toLowerCase() === 'search'
        let displayActive

        if (isThisTheSearchTab) {
          displayActive = isSearchModeActive
        } else {
          if (targetHrefDuringTransition) {
            // If we are in a specific transition exiting search, only the target tab is active
            displayActive = tab.href === targetHrefDuringTransition
          } else {
            // Normal operation: active if path matches and search mode is OFF
            displayActive = pathIsActive && !isSearchModeActive
          }
        }

        return (
          <Button
            key={tab.name}
            flexGrow={1}
            flexBasis={0}
            flexShrink={1}
            chromeless
            onPress={() => handleTabPress(tab)}
            paddingVertical="$2"
            pressStyle={{ backgroundColor: '$backgroundHover' }}
            minWidth={0}
            paddingHorizontal="$0"
            marginHorizontal={4}
          >
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              gap="$1"
              paddingHorizontal="$1"
            >
              <tab.icon color={displayActive ? '#138404' : '$color'} size={20} />
              <Text
                fontSize={10}
                color={displayActive ? '#138404' : '$color'}
                fontWeight={displayActive ? 'bold' : 'normal'}
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
