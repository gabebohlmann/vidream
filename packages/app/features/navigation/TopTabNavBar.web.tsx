// packages/app/features/navigation/TopTabNavBar.web.tsx
'use client'
import { Bell, Menu, Plus, Search, ArrowLeft, ChevronRight } from '@tamagui/lucide-icons'
import React, { useEffect, useState, useRef } from 'react'
import {
  Button,
  Separator,
  Text,
  View,
  isWeb,
  styled,
  useEvent,
  Input,
  // AnimatePresence, // Not used in current SmallScreenDrawerContent
  XStack,
  YStack,
  ScrollView, // Import ScrollView
} from 'tamagui'
import VidreamIcon from '@my/ui/src/components/VidreamIcon'
import { Link } from 'solito/link'
import { ProfileButton } from './ProfileButton.web'
import { useConvexAuth } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { rootLinks, allSidebarSections } from './commonLinks'
import type { NavLinkInfo } from './commonLinks'
import { Drawer } from './Drawer'

interface TopTabNavBarProps {
  isScreenSm: boolean
  isSearchActiveSm: boolean
  onSetSearchActiveSm: (active: boolean, targetHref?: string | null) => void
  onSearchSubmit?: (query: string) => void
  onToggleSidebarExpand?: () => void
}

const DrawerItem = styled(XStack, {
  name: 'DrawerItem',
  tag: 'div', // Use 'div' if Link asChild handles the anchor, or 'a' if this IS the anchor
  width: '100%',
  paddingVertical: '$3',
  paddingHorizontal: '$3.5',
  gap: '$3.5',
  alignItems: 'center',
  borderRadius: '$3',
  hoverStyle: { backgroundColor: '$backgroundHover' },
  pressStyle: { backgroundColor: '$backgroundPress' },
})

const DrawerSubheading = styled(Text, {
  name: 'DrawerSubheading',
  fontWeight: 'bold',
  fontSize: '$3',
  color: '$color',
  paddingVertical: '$2',
  paddingHorizontal: '$3.5',
  marginTop: '$2', // Space above subheading
  width: '100%',
})

function SmallScreenDrawerContent({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const renderDrawerItem = (item: NavLinkInfo | undefined): React.ReactNode => {
    if (!item || !item.slug) return null

    if (item.isSubheading) {
      const subheadingContent = (
        <XStack flex={1} ai="center" jc="space-between" gap="$2">
          <Text
            fontWeight="bold"
            fontSize="$4"
            color={item.href ? '$colorFocus' : '$color'}
            ellipse
          >
            {item.title}
          </Text>
          {item.href && <ChevronRight size={18} color="$colorFocus" />}
        </XStack>
      )

      if (item.href) {
        return (
          <Link
            href={item.href}
            key={item.slug}
            onPress={() => onOpenChange(false)}
            style={{ textDecoration: 'none', display: 'block', width: '100%' }}
            asChild
          >
            {/* Ensure DrawerItem uses a tag that Link asChild can work with, like 'div' or View-based component */}
            <DrawerItem tag="div">{subheadingContent}</DrawerItem>
          </Link>
        )
      }
      return <DrawerSubheading key={item.slug}>{item.title}</DrawerSubheading>
    }

    if (!item.href || !item.icon) {
      return null
    }

    return (
      <Link key={item.slug} href={item.href} onPress={() => onOpenChange(false)} asChild>
        <DrawerItem tag="div">
          <item.icon size={20} color="$color" />
          <Text fontSize="$4" color="$color" flex={1}>
            {item.title}
          </Text>
        </DrawerItem>
      </Link>
    )
  }

  const mappedRootLinks =
    rootLinks && Array.isArray(rootLinks) ? rootLinks.map(renderDrawerItem).filter(Boolean) : []

  const mappedSections =
    allSidebarSections && Array.isArray(allSidebarSections)
      ? allSidebarSections
          .map((section, sectionIndex) => {
            const sectionItems =
              section.links && Array.isArray(section.links)
                ? section.links.map(renderDrawerItem).filter(Boolean)
                : []

            // Determine if this section has any visible content (either a non-linkable subheading or actual items)
            const hasNonLinkableSubheading = section.links.find((l) => l.isSubheading && !l.href)
            if (sectionItems.length === 0 && !hasNonLinkableSubheading) {
              return null
            }

            // Determine if a separator is needed before this section's items
            // (not before the section's own subheading if it's the first thing)
            const needsSeparatorBeforeItems =
              (mappedRootLinks.length > 0 &&
                sectionIndex === 0 &&
                !section.links[0]?.isSubheading) ||
              (sectionIndex > 0 && !section.links[0]?.isSubheading && !section.noSeparatorBefore)

            return (
              <React.Fragment key={section.id}>
                {/* Separator before section items if needed (and if section itself doesn't start with subheading) */}
                {needsSeparatorBeforeItems ? (
                  <Separator marginVertical="$2.5" marginHorizontal="$3.5" />
                ) : null}
                {/* Render the items (which includes subheadings first if present) */}
                {sectionItems}
              </React.Fragment>
            )
          })
          .filter(Boolean)
      : []

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Drawer.Content
          paddingVertical="$0" // Drawer.Content itself has no vertical padding
          width={280}
          alignItems="flex-start"
          backgroundColor="$background"
          gap="$0" // No gap for direct children of Drawer.Content
          animation="medium"
          enterStyle={{ x: -280 }}
          exitStyle={{ x: -280 }}
          elevate
          shadowColor="$shadowColor"
          shadowOpacity={0.2}
          shadowRadius={10}
        >
          {/* Fixed Header Part */}
          <View paddingHorizontal="$3.5" paddingVertical="$3" width="100%">
            <Text fontSize="$6" fontWeight="bold">
              Menu
            </Text>
          </View>
          <Separator width="100%" />

          {/* Scrollable Content Part */}
          <ScrollView
            flex={1} // Allows ScrollView to take available vertical space
            width="100%"
            showsVerticalScrollIndicator={true} // Ensure scrollbar is visible
            // contentContainerStyle={{ paddingBottom: '$2' }} // Optional: if extra space needed at end of scroll
          >
            <YStack width="100%" gap="$0.5" paddingVertical="$2">
              {mappedRootLinks}
              {/* Separator between rootLinks and the first actual section content if both exist */}
              {mappedRootLinks.length > 0 &&
                mappedSections.length > 0 &&
                (allSidebarSections[0]?.links[0]?.isSubheading ||
                  !allSidebarSections[0]?.noSeparatorBefore) && (
                  <Separator marginVertical="$2.5" marginHorizontal="$3.5" />
                )}
              {mappedSections}
            </YStack>
          </ScrollView>

          {/* Fixed Footer Part */}
          <Separator width="100%" />
          <View paddingHorizontal="$3.5" paddingVertical="$2.5" width="100%">
            <ProfileButton />
          </View>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer>
  )
}

// ... (Rest of TopTabNavBar component, including its main return logic) ...
export function TopTabNavBar({
  isScreenSm,
  isSearchActiveSm,
  onSetSearchActiveSm,
  onSearchSubmit,
  onToggleSidebarExpand,
}: TopTabNavBarProps) {
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth()
  const { user, isSignedIn } = useUser()
  const isAuthenticated = isConvexAuthenticated && isSignedIn && user

  const [smDrawerOpen, setSmDrawerOpen] = useState(false)
  const toggleSmDrawer = useEvent(() => setSmDrawerOpen(!smDrawerOpen))

  const [searchQuerySm, setSearchQuerySm] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleCreatePress = () => {
    console.log('Create button pressed')
  }

  useEffect(() => {
    if (isScreenSm && isSearchActiveSm) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    }
  }, [isScreenSm, isSearchActiveSm])

  const handleSmSearchSubmit = () => {
    if (onSearchSubmit) {
      onSearchSubmit(searchQuerySm)
    }
  }

  const showTopBarLogo = (isScreenSm && !isSearchActiveSm) || !isScreenSm

  if (isScreenSm && isSearchActiveSm) {
    // SM Search Active UI
    return (
      <View
        flexDirection="row"
        paddingHorizontal="$2"
        paddingVertical="$2"
        width="100%"
        alignItems="center"
        backgroundColor="$background"
        minHeight={70}
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Button
          icon={<ArrowLeft size="$1.5" />}
          onPress={() => {
            onSetSearchActiveSm(false, null)
            setSearchQuerySm('')
          }}
          chromeless
          circular
          size="$3"
          marginRight="$2"
        />
        <Input
          ref={searchInputRef as any}
          flex={1}
          size="$3.5"
          placeholder="Search Vidream..."
          value={searchQuerySm}
          onChangeText={setSearchQuerySm}
          onSubmitEditing={handleSmSearchSubmit}
          borderRadius="$3"
        />
        {searchQuerySm.length > 0 && (
          <Button
            icon={<Plus size="$1" style={{ transform: [{ rotate: '45deg' }] }} />}
            onPress={() => setSearchQuerySm('')}
            chromeless
            circular
            size="$3"
            marginLeft="$2"
          />
        )}
      </View>
    )
  }

  // Default UI for TopTabNavBar
  return (
    <View
      flexDirection="row"
      paddingHorizontal="$3"
      paddingVertical="$2.5"
      width="100%"
      tag="nav"
      alignItems="center"
      backgroundColor="$background"
      minHeight={60}
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      <XStack alignItems="center" gap="$2.5">
        {isScreenSm && (
          <Button
            circular
            chromeless
            onPress={toggleSmDrawer}
            icon={<Menu size="$2" />}
            size="$3"
          />
        )}
        {!isScreenSm && onToggleSidebarExpand && (
          <Button
            circular
            chromeless
            onPress={onToggleSidebarExpand}
            icon={<Menu size="$2" />}
            size="$3"
            marginLeft="$1.5"
          />
        )}
        {showTopBarLogo && (
          <Link
            href="/"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '$2' }}
          >
            <XStack alignItems="center" gap="$0">
              <VidreamIcon />
              <Text fontSize="$6" fontWeight="bold" color="$color" paddingBottom="$1">
                Vidream
              </Text>
            </XStack>
          </Link>
        )}
      </XStack>

      {!isScreenSm && (
        <View flex={1} alignItems="center" justifyContent="center" paddingHorizontal="$4">
          <Button theme="alt1" icon={<Search />} chromeless width="60%" maxWidth={500}>
            Search...
          </Button>
        </View>
      )}

      {isScreenSm && <View flex={1} />}

      <View
        flexDirection="row"
        alignItems="center"
        gap="$2.5"
        marginLeft={!isScreenSm ? 'auto' : showTopBarLogo ? '$0' : 'auto'}
      >
        <Button
          size="$3"
          onPress={handleCreatePress}
          icon={<Plus size="$2" />}
          tooltip="Create"
          padding="$1.5"
        />
        {isAuthenticated && (
          <Button
            circular
            chromeless
            padding="$0"
            size="$3"
            icon={<Bell size="$1" strokeWidth={2} />}
            tooltip="Notifications"
          />
        )}
        <ProfileButton />
      </View>

      {isScreenSm && (
        <SmallScreenDrawerContent open={smDrawerOpen} onOpenChange={setSmDrawerOpen} />
      )}
    </View>
  )
}
