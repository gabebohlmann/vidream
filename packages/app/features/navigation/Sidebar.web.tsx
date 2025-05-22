// packages/app/features/navigation/Sidebar.web.tsx
'use client'

import React from 'react'
import { View, YStack, Text, styled, AnimatePresence, Separator } from 'tamagui'
import { primaryNavigationItems, allNavigationLinks } from './commonLinks'
import type { NavLinkInfo } from './commonLinks'
import { Link } from 'solito/link'

const SidebarButton = styled(Link, {
  name: 'SidebarButton',
  tag: 'a',
  display: 'flex',
  flexDirection: 'row',
  marginTop: '$2',
  paddingVertical: '$2.5',
  paddingHorizontal: '$0',
  marginHorizontal: '$3',
  gap: '$3',
  alignItems: 'flex-start', // This vertically aligns icon & text to the top in expanded view
  borderRadius: '$3',
  cursor: 'pointer',
  textDecorationLine: 'none',
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
      },
    },
    collapsed: {
      true: {
        flexDirection: 'column',
        paddingHorizontal: '$2',
        marginHorizontal: '$0',
        paddingVertical: '$2',
        justifyContent: 'center',
        alignItems: 'center', // This horizontally centers icon & text in collapsed view
        width: '100%',
        gap: '$1',
      },
    },
  } as const,
})

interface SidebarProps {
  isExpanded: boolean
}

export function Sidebar({ isExpanded }: SidebarProps) {
  const currentWidth = isExpanded ? 200 : 90 // Your current width values

  const renderNavItem = (link: NavLinkInfo, index: number) => (
    <SidebarButton key={link.slug} href={link.href} collapsed={!isExpanded}>
      {isExpanded ? (
        <>
          <link.icon size={20} color="$color" />
          <Text fontSize="$3" color="$color" fontWeight={'500'}>
            {link.title}
          </Text>
        </>
      ) : (
        <>
          {React.cloneElement(link.largeIcon, {
            size: 24,
            color: '$color',
          })}
          <Text fontSize="10px" color="$color" textAlign="left" numberOfLines={1} ellipse>
            {link.title}
          </Text>
        </>
      )}
    </SidebarButton>
  )

  return (
    <YStack
      width={currentWidth}
      backgroundColor="$background"
      paddingBottom="$3"
      // Regarding your padding:
      // paddingHorizontal sets L/R. paddingLeft overrides L.
      // So, current effective padding: Left=$4, Right (from paddingHorizontal's second value if it were split, or from $3)= $3
      // This might be why items feel offset if not intentional.
      // If paddingHorizontal is "$3", then Left=$4, Right=$3.
      // If paddingHorizontal is e.g., {isExpanded ? '$0' : '$0'}, then Left=$4, Right=$0.
      paddingHorizontal={isExpanded ? '$3' : '$3'}
      paddingLeft="$4" // You added this.
      marginHorizontal="$0"
      gap="$1.5"
      alignItems="flex-start"
      animation="medium"
      animateOnly={['width', 'paddingHorizontal', 'alignItems']}
      height="100%"
      position="sticky"
      top={0}
      zIndex={40}
      // Add border properties here
      borderRightWidth={1}
      borderRightColor="$borderColor" // Use your theme's border color token
    >
      {primaryNavigationItems.filter((link) => link.isPrimary).map(renderNavItem)}

      <AnimatePresence>
        {isExpanded && (
          <YStack
            animation="medium"
            enterStyle={{ opacity: 0, y: -5 }}
            exitStyle={{ opacity: 0, y: -5 }}
            gap="$1.5"
            alignSelf="stretch"
            alignItems="flex-start"
          >
            <Separator marginVertical="$2" width="100%" />
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
