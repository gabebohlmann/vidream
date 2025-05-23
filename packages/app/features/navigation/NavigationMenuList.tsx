// packages/app/features/navigation/NavigationMenuList.tsx
'use client'

import React from 'react'
import {
  View,
  YStack,
  Text,
  styled,
  AnimatePresence,
  Separator,
  XStack,
  ScrollView,
  ScrollViewProps,
  YStackProps,
} from 'tamagui'
import { rootLinks, allSidebarSections } from './commonLinks' // Assuming these are correctly structured
import type { NavLinkInfo, NavSection } from './commonLinks'
import { Link } from 'solito/link'
import { ChevronRight } from '@tamagui/lucide-icons'

// Styled components (can be kept here or moved to a shared file if used elsewhere)
const ItemDisplayFrame = styled(XStack, {
  name: 'NavigationItemDisplayFrame',
  width: '100%',
  paddingVertical: '$2.5',
  borderRadius: '$3',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: '$backgroundHover' },
  pressStyle: { backgroundColor: '$backgroundPress' },

  variants: {
    itemStyle: {
      expanded: {
        flexDirection: 'row',
        alignItems: 'flex-start', // User's setting for vertical top-align
        paddingHorizontal: '$0',
        gap: '$3',
      },
      collapsed: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '$2',
        paddingVertical: '$2',
        gap: '$1',
      },
      subheadingLink: {
        // For linkable subheadings
        flexDirection: 'row',
        alignItems: 'center', // Vertically center text and chevron
        paddingVertical: '$2',
        paddingHorizontal: '$0',
        gap: '$2',
      },
    },
    active: { true: { backgroundColor: '$backgroundFocus' } },
  } as const,
})

const SubheadingTextDisplay = styled(Text, {
  name: 'NavigationSubheadingText',
  fontWeight: 'bold',
  fontSize: '$4',
  color: '$color',
  paddingVertical: '$2',
  marginHorizontal: '$3', // For non-linkable subheadings, applies outer margin
  width: '100%',
  display: 'flex',
})

interface NavigationMenuListProps {
  mode: 'collapsedSidebar' | 'expandedSidebar' | 'drawer'
  rootLinksData: NavLinkInfo[]
  sectionsData?: NavSection[] // Optional for collapsed mode
  onLinkPress?: () => void // For drawer to close on item press
  // activeRoute?: string;
  // Props for the ScrollView or the YStack container for collapsed mode
  containerProps?: YStackProps // For collapsed mode YStack
  scrollViewProps?: ScrollViewProps // For expanded/drawer ScrollView
}

export function NavigationMenuList({
  mode,
  rootLinksData,
  sectionsData = [], // Default to empty array
  onLinkPress,
  // activeRoute,
  containerProps,
  scrollViewProps,
}: NavigationMenuListProps) {
  const isExpandedMode = mode === 'expandedSidebar' || mode === 'drawer'
  const isCollapsedSidebar = mode === 'collapsedSidebar'

  const renderSingleItem = (item: NavLinkInfo) => {
    if (!item || !item.slug) return null

    // Subheadings are only for expanded/drawer modes
    if (item.isSubheading && isExpandedMode) {
      const subheadingContent = (
        <XStack flex={1} ai="center" jc="space-between" gap="$2">
          <Text fontWeight="bold" fontSize="$3" color="$color" ellipse>
            {item.title}
          </Text>
          {item.href && <ChevronRight size={16} color="$colorFocus" />}
        </XStack>
      )
      if (item.href) {
        return (
          <Link
            href={item.href}
            key={item.slug}
            onPress={onLinkPress}
            style={{ textDecoration: 'none', display: 'block', marginHorizontal: '$3' }}
          >
            <ItemDisplayFrame itemStyle="subheadingLink" /* active={activeRoute === item.href} */>
              {subheadingContent}
            </ItemDisplayFrame>
          </Link>
        )
      }
      return <SubheadingTextDisplay key={item.slug}>{item.title}</SubheadingTextDisplay>
    }

    // Regular NavLinkItem
    if (!item.href) return null

    if (isCollapsedSidebar) {
      if (item.isRootLink && item.largeIcon) {
        return (
          <Link
            href={item.href}
            key={item.slug}
            onPress={onLinkPress}
            style={{ textDecoration: 'none', display: 'block', marginHorizontal: '$0' }}
          >
            <ItemDisplayFrame itemStyle="collapsed" /* active={activeRoute === item.href} */>
              {React.cloneElement(item.largeIcon, { size: 24, color: '$color' })}
              <Text fontSize="10px" color="$color" textAlign="center" numberOfLines={1} ellipse>
                {item.title}
              </Text>
            </ItemDisplayFrame>
          </Link>
        )
      }
      return null
    }

    if (isExpandedMode && item.icon) {
      return (
        <Link
          href={item.href}
          key={item.slug}
          onPress={onLinkPress}
          style={{ textDecoration: 'none', display: 'block', marginHorizontal: '$3' }}
        >
          <ItemDisplayFrame itemStyle="expanded" /* active={activeRoute === item.href} */>
            <item.icon size={20} color="$color" />
            <Text fontSize="$3" color="$color" fontWeight={'500'}>
              {item.title}
            </Text>
          </ItemDisplayFrame>
        </Link>
      )
    }
    return null
  }

  if (isCollapsedSidebar) {
    return (
      <YStack
        flex={1}
        width="100%"
        alignItems="center"
        justifyContent="flex-start"
        gap="$1.5"
        paddingVertical="$1.5"
        {...containerProps} // e.g., paddingHorizontal from parent
      >
        {rootLinksData
          .filter((item) => item.isRootLink && item.largeIcon && item.href)
          .map(renderSingleItem)}
        <View flex={1} /> {/* Spacer */}
      </YStack>
    )
  }

  // Expanded Sidebar or Drawer Mode (Scrollable)
  return (
    <ScrollView
      flex={1}
      width="100%"
      showsVerticalScrollIndicator={true}
      {...scrollViewProps} // e.g., paddingLeft, paddingRight, paddingTop, paddingBottom from parent
    >
      <YStack
        gap="$0.5" // Gap between items/sections in the scrollable content
        alignItems="flex-start"
        // paddingTop/Bottom are now part of scrollViewProps or default here
        paddingVertical="$1" // Minimal vertical padding for the content YStack itself
      >
        {/* Root Links - rendered in their "expanded" item style */}
        {rootLinksData.filter((item) => item.icon && item.href).map(renderSingleItem)}

        {/* Separator if sections follow and rootLinks exist */}
        {sectionsData.length > 0 && rootLinksData.length > 0 && (
          <Separator marginVertical="$2" width="90%" alignSelf="center" />
        )}

        {/* Sections */}
        <AnimatePresence>
          {/* No need for isExpanded check on YStack as this whole block is conditional on isExpandedMode */}
          <YStack
            animation="medium" // Only if AnimatePresence is actually doing something for this YStack
            enterStyle={{ opacity: 0, y: -5 }}
            exitStyle={{ opacity: 0, y: -5 }}
            gap="$0.5"
            alignSelf="stretch"
            alignItems="flex-start"
          >
            {sectionsData.map((section, sectionIdx) => (
              <React.Fragment key={section.id}>
                {/* Show separator if not the first section in this block AND not flagged to hide */}
                {sectionIdx > 0 && !section.noSeparatorBefore && (
                  <Separator marginVertical="$2" width="90%" alignSelf="center" />
                )}
                {/* Render each item (subheading or link) within the section */}
                {Array.isArray(section.links) && section.links.map(renderSingleItem)}
              </React.Fragment>
            ))}
          </YStack>
        </AnimatePresence>
        {/* Footer can be added here if it should scroll, or outside ScrollView if fixed */}
      </YStack>
    </ScrollView>
  )
}
