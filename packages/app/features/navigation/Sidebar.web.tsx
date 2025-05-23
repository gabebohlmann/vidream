// packages/app/features/navigation/Sidebar.web.tsx
'use client'

import React from 'react'
import { View, YStack, Text, styled, AnimatePresence, Separator, XStack, ScrollView } from 'tamagui'
import { rootLinks, allSidebarSections } from './commonLinks'
import type { NavLinkInfo } from './commonLinks'
import { Link } from 'solito/link'
import { ChevronRight } from '@tamagui/lucide-icons'

const SidebarInteractiveItem = styled(XStack, {
  name: 'SidebarInteractiveItem',
  width: '100%',
  paddingVertical: '$2.5',
  borderRadius: '$3',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: '$backgroundHover' },
  pressStyle: { backgroundColor: '$backgroundPress' },
  variants: {
    isExpandedState: {
      true: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: '$0',
        gap: '$3',
      },
      false: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '$2',
        paddingVertical: '$2',
        gap: '$1',
      },
    },
    isSubheadingLinkStyle: {
      true: {
        paddingVertical: '$2',
        paddingHorizontal: '$0',
        alignItems: 'center',
      },
    },
    active: { true: { backgroundColor: '$backgroundFocus' } },
  } as const,
})

const SubheadingTextDisplay = styled(Text, {
  name: 'SubheadingTextDisplay',
  fontWeight: 'bold',
  fontSize: '$4',
  color: '$color',
  paddingVertical: '$2',
  marginHorizontal: '$3',
  width: '100%',
  display: 'flex',
})

interface SidebarProps {
  isExpanded: boolean
  // activeRoute?: string;
}

export function Sidebar({ isExpanded /*, activeRoute */ }: SidebarProps) {
  const currentWidth = isExpanded ? 200 : 90

  const renderItem = (item: NavLinkInfo | undefined): React.ReactNode => {
    // Ensure item can be undefined
    if (!item || !item.slug) return null

    if (item.isSubheading) {
      // Subheadings are only rendered if the sidebar is expanded
      if (!isExpanded) return null

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
            style={{ textDecoration: 'none', display: 'block', marginHorizontal: '$3' }}
          >
            <SidebarInteractiveItem
              isExpandedState={true}
              isSubheadingLinkStyle={true} /* active={activeRoute === item.href} */
            >
              {subheadingContent}
            </SidebarInteractiveItem>
          </Link>
        )
      }
      return <SubheadingTextDisplay key={item.slug}>{item.title}</SubheadingTextDisplay>
    }

    // Regular NavLinkItem
    if (!item.href) return null // Must have href to be a link

    if (!isExpanded) {
      // COLLAPSED VIEW
      if (item.isRootLink && item.largeIcon) {
        return (
          <Link
            href={item.href}
            key={item.slug}
            style={{ textDecoration: 'none', display: 'block', marginHorizontal: '$0' }}
          >
            <SidebarInteractiveItem
              isExpandedState={false} /* active={activeRoute === item.href} */
            >
              {React.cloneElement(item.largeIcon, { size: 24, color: '$color' })}
              <Text fontSize="10px" color="$color" textAlign="center" numberOfLines={1} ellipse>
                {item.title}
              </Text>
            </SidebarInteractiveItem>
          </Link>
        )
      }
      return null
    }

    // EXPANDED VIEW
    if (item.icon) {
      return (
        <Link
          href={item.href}
          key={item.slug}
          style={{ textDecoration: 'none', display: 'block', marginHorizontal: '$3' }}
        >
          <SidebarInteractiveItem isExpandedState={true} /* active={activeRoute === item.href} */>
            <item.icon size={20} color="$color" />
            <Text fontSize="$3" color="$color" fontWeight={'500'}>
              {item.title}
            </Text>
          </SidebarInteractiveItem>
        </Link>
      )
    }
    return null
  }

  const rootLinkItems =
    rootLinks && Array.isArray(rootLinks) ? rootLinks.map(renderItem).filter(Boolean) : []
  const sectionsContent =
    isExpanded && allSidebarSections && Array.isArray(allSidebarSections) ? (
      <AnimatePresence>
        <YStack
          animation="medium"
          enterStyle={{ opacity: 0, y: -5 }}
          exitStyle={{ opacity: 0, y: -5 }}
          gap="$0.5"
          alignSelf="stretch"
          alignItems="flex-start"
          // Removed marginTop here, will be handled by separator or YStack gap from parent
        >
          {allSidebarSections.map((section, sectionIdx) => (
            <React.Fragment key={section.id}>
              {(sectionIdx > 0 &&
                !section.noSeparatorBefore &&
                section.links &&
                section.links.length > 0 &&
                !section.links[0]?.isSubheading) ||
              (sectionIdx === 0 &&
                rootLinks &&
                rootLinks.length > 0 &&
                section.links &&
                section.links.length > 0 &&
                !section.links[0]?.isSubheading) ? ( // Separator after rootLinks if first section doesn't start with subheading
                <Separator marginVertical="$2" width="100%" />
              ) : null}
              {Array.isArray(section.links) && section.links.map(renderItem).filter(Boolean)}
            </React.Fragment>
          ))}
        </YStack>
      </AnimatePresence>
    ) : null

  return (
    <YStack
      width={currentWidth}
      backgroundColor="$background"
      height="100%"
      position="sticky"
      top={0}
      zIndex={40}
      borderRightWidth={1}
      borderRightColor="$borderColor"
      animation="medium"
      animateOnly={['width']}
    >
      {!isExpanded && (
        <YStack
          flex={1}
          paddingHorizontal="$0"
          paddingVertical="$1.5" // Overall vertical padding for collapsed items
          gap="$1.5"
          alignItems="center"
        >
          {rootLinkItems}
          <View flex={1} />
        </YStack>
      )}

      {isExpanded && (
        <ScrollView
          flex={1}
          width="100%"
          showsVerticalScrollIndicator={true}
          paddingLeft="$4"
          paddingRight="$3"
          paddingTop="$2" // Padding at the start of scrollable area
          paddingBottom="$3" // Padding at the end of scrollable area
        >
          <YStack gap="$0.5" alignItems="flex-start">
            {rootLinkItems}
            {/* Separator between rootLinks and sections block, if both have content */}
            {rootLinks && rootLinks.length > 0 && sectionsContent ? (
              <Separator marginVertical="$2" width="100%" />
            ) : null}
            {sectionsContent}
            {/* Footer content inside scroll */}
            <View
              marginTop="$4"
              paddingHorizontal="$0"
              paddingBottom="$2"
              paddingTop="$2"
              borderTopWidth={1}
              borderTopColor="$borderColorLowContrast"
            >
              <Text fontSize="$2" color="$colorSubtle" ta="center">
                © Vidream {new Date().getFullYear()}
              </Text>
            </View>
          </YStack>
        </ScrollView>
      )}
    </YStack>
  )
}
