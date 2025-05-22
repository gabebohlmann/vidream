// packages/app/features/navigation/BottomTabNavBar.tsx
'use client'

import { Button, Text, XStack, YStack, useMedia } from 'tamagui'
import { useRouter, usePathname } from 'solito/navigation'
import type { TabConfig } from '@my/config/src/tabs'

interface CustomBottomTabBarProps {
  tabs: TabConfig[]
}

export function BottomTabNavBar({ tabs }: CustomBottomTabBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { sm } = useMedia()

  // For debugging the active state:
  // console.log('Current Pathname:', pathname);

  if (!sm) {
    // return null;
  }

  const handleTabPress = (href: string) => {
    router.push(href)
  }

  return (
    <XStack
      height={60}
      borderTopWidth={1}
      borderTopColor="$borderColor"
      backgroundColor="$background"
      alignItems="center"
      justifyContent="space-around"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      width="100%"
      zIndex={10}
    >
      {tabs.map((tab) => {
        // Option 1: Your original isActive logic (debug with console.log)
        // const isActiveOriginal = pathname === tab.href || (tab.href !== '/app/home' && pathname.startsWith(tab.href));

        // Option 2: Simplified and often more robust isActive logic
        let isActive;
        if (tab.href === '/app/home') { // IMPORTANT: Ensure '/app/home' is the correct unique href for your Home tab
          isActive = pathname === tab.href;
        } else {
          isActive = pathname.startsWith(tab.href);
        }

        // For debugging the active state for each tab:
        // console.log('Tab Check:', {
        //   tabName: tab.name,
        //   tabHref: tab.href,
        //   currentPathname: pathname,
        //   calculatedIsActive: isActive
        // });

        return (
          <Button
            key={tab.name}
            // Explicit flex properties to enforce equal width more strongly
            flexGrow={1}
            flexBasis={0} // This is key: tells flex items to disregard content size for initial basis
            flexShrink={1} // Allow shrinking if absolutely necessary
            chromeless
            onPress={() => handleTabPress(tab.href)}
            backgroundColor={isActive ? '$backgroundHover' : 'transparent'}
            paddingVertical="$2"
            pressStyle={{ backgroundColor: '$backgroundHover' }}
            minWidth={0} // Override any default minWidth from Button styles
            // To ensure no horizontal padding on the button itself interferes with flexBasis:0
            paddingHorizontal="$0"
            marginHorizontal={4}
          >
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              gap="$1"
              // If you need padding *inside* the button, around icon/text:
              paddingHorizontal="$1" // e.g., token $1 or $2 for small internal padding
            >
              <tab.icon color={isActive ? '$colorFocus' : '$color'} size={20} />
              <Text
                fontSize={10}
                color={isActive ? '$colorFocus' : '$color'}
                fontWeight={isActive ? 'bold' : 'normal'}
                textAlign="center" // Center text, especially if it wraps
                // The Text component should wrap by default if its content is too long
                // for the width of this YStack (which is constrained by the Button).
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