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
  XStack,
  YStack,
  ScrollView,
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

const DrawerClickableItem = styled(XStack, {
  name: 'DrawerClickableItem',
  tag: 'div',
  width: '100%',
  paddingVertical: '$3',
  paddingHorizontal: '$3.5',
  gap: '$3.5',
  alignItems: 'center',
  borderRadius: '$3',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: '$backgroundHover' },
  pressStyle: { backgroundColor: '$backgroundPress' },
})

const DrawerSubheadingText = styled(Text, {
  name: 'DrawerSubheadingText',
  fontWeight: 'bold',
  fontSize: '$3',
  color: '$color',
  paddingVertical: '$2',
  paddingHorizontal: '$3.5',
  marginTop: '$2',
  width: '100%',
})

function SmallScreenDrawerContent({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!open) {
    return null
  }

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
          {item.href ? <ChevronRight size={18} color="$colorFocus" /> : null}
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
            <DrawerClickableItem>{subheadingContent}</DrawerClickableItem>
          </Link>
        )
      }
      return <DrawerSubheadingText key={item.slug}>{item.title}</DrawerSubheadingText>
    }

    if (!item.href || !item.icon) return null

    return (
      <Link key={item.slug} href={item.href} onPress={() => onOpenChange(false)} asChild>
        <DrawerClickableItem>
          <item.icon size={20} color="$color" />
          <Text fontSize="$4" color="$color" flex={1}>
            {item.title}
          </Text>
        </DrawerClickableItem>
      </Link>
    )
  }

  const rootLinkElements = (rootLinks || []).map(renderDrawerItem).filter(Boolean)
  const sectionElements = (allSidebarSections || [])
    .map((section, sectionIndex) => {
      const itemsInSection = section.links?.map(renderDrawerItem).filter(Boolean) || []
      const hasVisibleContent =
        itemsInSection.length > 0 || section.links?.find((l) => l.isSubheading && !l.href)
      if (!hasVisibleContent) return null

      const needsSeparator =
        ((rootLinkElements.length > 0 && sectionIndex === 0) || sectionIndex > 0) &&
        !section.links?.[0]?.isSubheading &&
        !section.noSeparatorBefore

      return (
        <React.Fragment key={section.id}>
          {needsSeparator ? <Separator marginVertical="$2.5" marginHorizontal="$3.5" /> : null}
          {itemsInSection}
        </React.Fragment>
      )
    })
    .filter(Boolean)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <React.Fragment>
          <Drawer.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
          <Drawer.Content
            flex={1}
            paddingVertical="$0"
            width={280}
            alignItems="stretch"
            backgroundColor="$background"
            gap="$0"
            animation="medium"
            enterStyle={{ x: -280 }}
            exitStyle={{ x: -280 }}
            elevate
            zIndex={100000}
            pointerEvents="auto" // Explicitly ensure pointer events are on for content
          >
            {/* Fixed Header Part - Ensure no stray spaces between these direct children */}
            <View paddingHorizontal="$3.5" paddingVertical="$3" width="100%">
              <Text fontSize="$6" fontWeight="bold">
                Menu
              </Text>
            </View>
            <Separator width="100%" />
            {/* Scrollable Content Part */}
            <ScrollView
              flex={1}
              width="100%"
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingVertical: '$2' }} // Padding for the scrollable surface itself
              // Test: Add a distinct background to the ScrollView to see its bounds
              // backgroundColor="$color3"
            >
              <YStack width="100%" gap="$0.5">
                {/* Render pre-calculated, filtered root link elements */}
                {rootLinkElements.length > 0 ? rootLinkElements : null}
                {/* Separator: Only if there are root links AND sections to separate */}
                {rootLinkElements.length > 0 && sectionElements.length > 0 ? (
                  <Separator marginVertical="$2.5" marginHorizontal="$3.5" />
                ) : null}
                {/* Render pre-calculated, filtered section elements */}
                {sectionElements.length > 0 ? sectionElements : null}
              </YStack>
            </ScrollView>
          </Drawer.Content>
        </React.Fragment>
      </Drawer.Portal>
    </Drawer>
  )
}

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
        {isScreenSm ? (
          <Button
            circular
            chromeless
            onPress={toggleSmDrawer}
            icon={<Menu size="$2" />}
            size="$3"
          />
        ) : null}
        {!isScreenSm && onToggleSidebarExpand ? (
          <Button
            circular
            chromeless
            onPress={onToggleSidebarExpand}
            icon={<Menu size="$2" />}
            size="$3"
            marginLeft="$1.5"
          />
        ) : null}
        {showTopBarLogo ? (
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
        ) : null}
      </XStack>

      {!isScreenSm ? (
        <View flex={1} alignItems="center" justifyContent="center" paddingHorizontal="$4">
          <Button theme="alt1" icon={<Search />} chromeless width="60%" maxWidth={500}>
            Search...
          </Button>
        </View>
      ) : null}

      {isScreenSm ? <View flex={1} /> : null}

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
        {isAuthenticated ? (
          <Button
            circular
            chromeless
            padding="$0"
            size="$3"
            icon={<Bell size="$1" strokeWidth={2} />}
            tooltip="Notifications"
          />
        ) : null}
        <ProfileButton />
      </View>

      {isScreenSm && open /* This should be smDrawerOpen */ ? (
        <SmallScreenDrawerContent open={smDrawerOpen} onOpenChange={setSmDrawerOpen} />
      ) : null}
    </View>
  )
}
