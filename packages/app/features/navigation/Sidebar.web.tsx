// packages/app/features/navigation/Sidebar.web.tsx
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
  ScrollView, // Import ScrollView
} from 'tamagui'
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
      }
    },
    active: { true: { backgroundColor: '$backgroundFocus' } },
  } as const,
});

const SubheadingTextDisplay = styled(Text, {
  name: 'SubheadingTextDisplay',
  fontWeight: 'bold',
  fontSize: '$4',
  color: '$color',
  paddingVertical: '$2',
  marginHorizontal: '$3',
  width: '100%',
  display: 'flex',
});

interface SidebarProps {
  isExpanded: boolean;
  // activeRoute?: string;
}

export function Sidebar({ isExpanded /*, activeRoute */ }: SidebarProps) {
  const currentWidth = isExpanded ? 200 : 90;

  const renderItem = (item: NavLinkInfo) => {
    if (!item || !item.slug) return null;

    if (item.isSubheading) {
      // Subheadings are only rendered if the sidebar is expanded (handled by parent conditional)
      const subheadingContent = (
        <XStack flex={1} ai="center" jc="space-between" gap="$2">
          <Text fontWeight="bold" fontSize="$3" color="$color" ellipse>
            {item.title}
          </Text>
          {item.href && <ChevronRight size={16} color="$colorFocus" />}
        </XStack>
      );
      if (item.href) {
        return (
          <Link
            href={item.href}
            key={item.slug}
            style={{ textDecoration: 'none', display: 'block', marginHorizontal: '$3' }}
          >
            <SidebarInteractiveItem isExpandedState={true} isSubheadingLinkStyle={true}>
              {subheadingContent}
            </SidebarInteractiveItem>
          </Link>
        );
      }
      return <SubheadingTextDisplay key={item.slug}>{item.title}</SubheadingTextDisplay>;
    }

    if (!item.href) return null;

    // This function is now called for items *within* the expanded ScrollView
    // or for rootLinks in the collapsed view.
    if (!isExpanded) { // COLLAPSED VIEW (for rootLinks)
      if (item.isRootLink && item.largeIcon) {
        return (
          <Link href={item.href} key={item.slug} style={{ textDecoration: 'none', display: 'block', marginHorizontal: '$0' }}>
            <SidebarInteractiveItem isExpandedState={false}>
              {React.cloneElement(item.largeIcon, { size: 24, color: '$color' })}
              <Text fontSize="10px" color="$color" textAlign="center" numberOfLines={1} ellipse>
                {item.title}
              </Text>
            </SidebarInteractiveItem>
          </Link>
        );
      }
      return null;
    }

    // EXPANDED VIEW (for all items inside ScrollView)
    if (item.icon) {
      return (
        <Link href={item.href} key={item.slug} style={{ textDecoration: 'none', display: 'block', marginHorizontal: '$3' }}>
          <SidebarInteractiveItem isExpandedState={true}>
            <item.icon size={20} color="$color" />
            <Text fontSize="$3" color="$color" fontWeight={'500'}>
              {item.title}
            </Text>
          </SidebarInteractiveItem>
        </Link>
      );
    }
    return null;
  };

  return (
    <YStack // This is the main fixed-size sidebar container
      width={currentWidth}
      backgroundColor="$background"
      height="100%" // It takes full viewport height
      position="sticky"
      top={0}
      zIndex={40}
      borderRightWidth={1}
      borderRightColor="$borderColor"
      // Animation for width change
      animation="medium"
      animateOnly={['width']}
    >
      {!isExpanded && (
        // Collapsed View: Items directly in YStack, centered
        <YStack
          flex={1} // Use flex to push content to top if not enough items
          paddingHorizontal="$0" // Let items center themselves
          paddingVertical="$2" // Some overall padding for collapsed items
          gap="$1.5"
          alignItems="center"
        >
          {rootLinks.map(renderItem)}
          <View flex={1} /> {/* Spacer to push items up if not filling height */}
        </YStack>
      )}

      {isExpanded && (
        <ScrollView
          flex={1} // ScrollView takes all available space within the main YStack
          width="100%"
          showsVerticalScrollIndicator={true} // Show scrollbar
          // Apply overall padding for the scrollable content area
          // paddingHorizontal is now $0 as items manage their own marginHorizontal: $3
          // paddingLeft and paddingRight on the ScrollView or its contentContainerStyle
          // will set the overall inset from the sidebar edges.
          // Using YStack's paddingLeft=$4, paddingRight=$3 from your previous structure.
          paddingLeft="$4"
          paddingRight="$3"
          // paddingTop and paddingBottom will be on the inner YStack
        >
          <YStack // This YStack holds all scrollable content
            gap="$0.5" // Consistent small gap between all items/sections
            alignItems="flex-start" // All items/sections start from left
            paddingTop="$2"     // Space at the very top of scrollable content
            paddingBottom="$3"  // Space at the very end of scrollable content
          >
            {/* Render Root Links first (now part of scroll) */}
            {rootLinks.map(renderItem)}

            {/* Separator if sections follow */}
            {allSidebarSections.length > 0 && rootLinks.length > 0 && (
              <Separator marginVertical="$2" width="100%" />
            )}

            {/* Render Sections - AnimatePresence can wrap the YStack for sections */}
            <AnimatePresence>
              <YStack
                animation="medium"
                enterStyle={{ opacity: 0, y: -5 }}
                exitStyle={{ opacity: 0, y: -5 }}
                gap="$0.5"
                alignSelf="stretch"
                alignItems="flex-start"
                // marginTop is handled by the Separator or padding/gap of parent
              >
                {allSidebarSections.map((section, sectionIdx) => (
                  <React.Fragment key={section.id}>
                    {sectionIdx > 0 && !section.noSeparatorBefore && (
                      <Separator marginVertical="$2" width="100%" />
                    )}
                    {Array.isArray(section.links) && section.links.map(renderItem)}
                  </React.Fragment>
                ))}
              </YStack>
            </AnimatePresence>

             {/* Footer content if it should scroll with the rest */}
            <View marginTop="$4" paddingHorizontal="$0" paddingBottom="$2" borderTopWidth={1} borderTopColor="$borderColorLowContrast">
                <Text fontSize="$2" color="$colorSubtle" ta="center">© Vidream App</Text>
            </View>
          </YStack>
        </ScrollView>
      )}
    </YStack>
  );
}