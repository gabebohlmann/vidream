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
  paddingVertical: '$2.5',
  paddingHorizontal: '$32',
  gap: '$3', // This gap will apply between icon and text when expanded
  alignItems: 'center',
  borderRadius: '$3',
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
        // color: '$colorFocus', // Text color might need to be handled directly on Text component
        // If you want icon color to change, it needs to be passed to the icon
      },
    },
    collapsed: {
      true: {
        flexDirection: 'column', // Arrange icon and text vertically
        paddingHorizontal: '$1', // Minimal horizontal padding for the content inside
        paddingVertical: '$2',   // Adjust vertical padding for collapsed state
        justifyContent: 'center',
        alignItems: 'center',    // Center items horizontally in the column
        width: '100%',
        gap: '$1', // Smaller gap for vertical icon and text
      },
    },
  } as const,
})

export function Sidebar() {
  // Default to collapsed view
  const [isExpanded, setIsExpanded] = useState(false)
  // Widen the collapsed sidebar, e.g., to 96px. Adjust as needed.
  const currentWidth = isExpanded ? 240 : 80

  // TODO: Determine active route for active styling
  // const pathname = usePathname();

  const renderNavItem = (link: NavLinkInfo, index: number) => (
    <Link key={link.slug} href={link.href} asChild>
      <SidebarButton
        // active={pathname === link.href} // Implement your active state logic
        collapsed={!isExpanded}
      >
        {isExpanded ? (
          <>
            {/* Expanded: Icon and Text side-by-side */}
            <link.icon size={20} color="$color" />
            <Text
              fontSize="$3" // Consistent with common sidebar text sizes
              color="$color" // Default color
              fontWeight={"500"}
            >
              {link.title}
            </Text>
          </>
        ) : (
          // Collapsed: Icon above Text
          <>
            {React.cloneElement(link.largeIcon, {
              size: 24,
              color: "$color",
            })}
            <Text
              fontSize="10px  "
              color="$color"
              textAlign="center"
              numberOfLines={1}
              ellipse
              // Ensure the text component itself can occupy a reasonable width if needed
              // though the parent button width (constrained by currentWidth) is the primary factor.
              // minWidth={50} // Example, if text itself needs a min width before ellipsizing
              // maxWidth="100%" // Ensure it doesn't overflow its container
            >
              {link.title}
            </Text>
          </>
        )}
      </SidebarButton>
    </Link>
  )

  return (
    <YStack
      width={currentWidth}
      backgroundColor="$background"
      paddingVertical="$3"
      paddingHorizontal={isExpanded ? "$3" : "$1.5"}
      gap="$1.5"
      borderRightWidth={1}
      borderRightColor="$borderColor"
      animation="medium"
      animateOnly={['width', 'paddingHorizontal']}
      height="100vh"
      position="sticky"
      top={0}
      zIndex={50}
    >
      <XStack
        paddingHorizontal={isExpanded ? '$0' : '$0'}
        alignItems="center"
        justifyContent={isExpanded ? 'flex-start' : 'center'}
        marginBottom="$2"
        minHeight={40}
      >
        <Button
          // Ensure the icon flips correctly based on the new default state
          icon={isExpanded ? <ChevronLeft /> : <Menu />}
          onPress={() => setIsExpanded(!isExpanded)}
          chromeless
          circular
          size="$3.5"
        />
        {isExpanded && (
          <Link href="/" style={{ textDecoration: 'none', marginLeft: '$3' }}>
            <Text fontSize="$6" fontWeight="bold" color="$color">
              Vidream
            </Text>
          </Link>
        )}
      </XStack>

      {/* Primary Navigation Items */}
      {primaryNavigationItems.filter((link) => link.isPrimary).map(renderNavItem)}

      <AnimatePresence>
        {isExpanded && (
          <YStack
            animation="medium"
            enterStyle={{ opacity: 0, y: -5 }}
            exitStyle={{ opacity: 0, y: -5 }}
            gap="$1.5"
          >
            <Separator marginVertical="$2" />
            {allNavigationLinks.filter((link) => !link.isPrimary).map(renderNavItem)}
          </YStack>
        )}
      </AnimatePresence>

      <View flex={1} />

      {isExpanded && (
        <View paddingHorizontal="$0" paddingBottom="$2">
          {/* Footer content */}
        </View>
      )}
    </YStack>
  )
}