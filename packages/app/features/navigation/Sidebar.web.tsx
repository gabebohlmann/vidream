// packages/app/features/navigation/Sidebar.web.tsx
'use client'

import React, { useState } from 'react'
import { Button, View, YStack, XStack, Text, styled, AnimatePresence, Separator } from 'tamagui'
import { Link } from 'solito/link'
import { Menu, ChevronLeft } from '@tamagui/lucide-icons'
import { primaryNavigationItems, allNavigationLinks } from './commonLinks' // Import your defined links
import type { NavLinkInfo } from './commonLinks'

const SidebarButton = styled(XStack, {
  name: 'SidebarButton',
  tag: 'a', // For semantic HTML when used with Solito's Link asChild
  paddingVertical: '$2.5', // Adjusted padding
  paddingHorizontal: '$3',
  gap: '$3',
  alignItems: 'center',
  borderRadius: '$3', // Slightly larger radius
  cursor: 'pointer',

  hoverStyle: {
    backgroundColor: '$backgroundHover',
  },
  pressStyle: {
    backgroundColor: '$backgroundPress',
  },

  variants: {
    active: {
      true: {
        backgroundColor: '$backgroundFocus',
        fontWeight: 'bold',
        // Add other active styles if needed
      },
    },
    collapsed: {
      true: {
        paddingHorizontal: '$0', // No horizontal padding when collapsed
        justifyContent: 'center', // Center icon when collapsed
        width: '100%', // Ensure it takes full width for centering
      },
    },
  } as const,
})

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true) // Default to expanded
  const currentWidth = isExpanded ? 240 : 72 // Standard widths for expanded/collapsed sidebars

  // TODO: Determine active route, e.g., using Solito's usePathname
  // const pathname = usePathname(); // If you're using Next.js with Solito

  const renderNavItem = (link: NavLinkInfo, index: number) => (
    <Link key={link.slug} href={link.href} asChild>
      <SidebarButton
        // active={pathname === link.href} // Example active state
        collapsed={!isExpanded}
      >
        {isExpanded ? (
          <>
            <link.icon size={20} color="$color" />
            <Text
              fontSize="$4"
              color="$color"
              fontWeight={/*pathname === link.href ? '700' :*/ '500'}
            >
              {link.title}
            </Text>
          </>
        ) : (
          React.cloneElement(link.largeIcon, { color: '$color' }) // Ensure largeIcon has proper props
        )}
      </SidebarButton>
    </Link>
  )

  return (
    <YStack
      width={currentWidth}
      backgroundColor="$background" // Or a specific sidebar background color e.g. $background2
      paddingVertical="$3"
      paddingHorizontal={isExpanded ? '$3' : '$2'} // Adjust horizontal padding based on state
      gap="$2" // Gap between items
      borderRightWidth={1}
      borderRightColor="$borderColor"
      animation="medium"
      animateOnly={['width', 'paddingHorizontal']}
      height="100vh"
      position="sticky"
      top={0}
      zIndex={50} // Ensure it's above content but below modals/drawers
    >
      {/* Header: Hamburger Menu / Toggle Button & Optional Logo */}
      <XStack
        paddingHorizontal={isExpanded ? '$0' : '$0'} // No extra padding for this row here, handled by parent
        alignItems="center"
        justifyContent={isExpanded ? 'flex-start' : 'center'} // Align button to start or center
        marginBottom="$2"
        minHeight={40} // Ensure consistent height for the button area
      >
        <Button
          icon={isExpanded ? <ChevronLeft /> : <Menu />}
          onPress={() => setIsExpanded(!isExpanded)}
          chromeless
          circular
          size="$3.5" // Slightly larger button
        />
        {isExpanded && (
          <Link href="/" style={{ textDecoration: 'none', marginLeft: '$3' }}>
            {/* You can place your App logo/name here if desired */}
            {/* <VidreamIcon /> */}
            <Text fontSize="$6" fontWeight="bold" color="$color">
              Vidream
            </Text>
          </Link>
        )}
      </XStack>

      {/* Primary Navigation Items */}
      {primaryNavigationItems.filter((link) => link.isPrimary).map(renderNavItem)}

      {/* Divider and Additional links when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <YStack
            animation="medium"
            enterStyle={{ opacity: 0, y: -5 }}
            exitStyle={{ opacity: 0, y: -5 }}
            gap="$2" // Keep consistent gap
          >
            <Separator marginVertical="$2" />
            {allNavigationLinks.filter((link) => !link.isPrimary).map(renderNavItem)}
          </YStack>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <View flex={1} />

      {/* Optional: Footer content like user profile, settings shortcut */}
      {isExpanded && (
        <View paddingHorizontal="$0" paddingBottom="$2">
          {/* Example: <ProfileButton /> or other elements */}
          {/* <Text fontSize="$2" color="$colorPress" textAlign="center">
            © Vidream
          </Text> */}
        </View>
      )}
    </YStack>
  )
}
