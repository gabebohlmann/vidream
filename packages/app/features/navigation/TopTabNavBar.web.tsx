// packages/app/features/navigation/TopTabNavBar.web.tsx
'use client'
import { Bell, Menu, Plus, Search, ArrowLeft } from '@tamagui/lucide-icons'
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
  AnimatePresence,
  XStack,
} from 'tamagui'
import VidreamIcon from '@my/ui/src/components/VidreamIcon'
import { Link } from 'solito/link'
import { ProfileButton } from './ProfileButton.web'
import { useConvexAuth } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { allNavigationLinks } from './commonLinks'
import type { NavLinkInfo } from './commonLinks'
import { Drawer } from './Drawer'

interface TopTabNavBarProps {
  isScreenSm: boolean
  isSearchActiveSm: boolean
  onSetSearchActiveSm: (active: boolean) => void
  onSearchSubmit?: (query: string) => void
  onToggleSidebarExpand?: () => void
}

function SmallScreenDrawerContent({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Drawer.Content
          paddingVertical="$4"
          width={280}
          alignItems="flex-start"
          backgroundColor="$background"
          borderRightWidth={isWeb ? 0 : 1}
          borderRightColor="$borderColor"
          gap="$2"
          animation="medium"
          enterStyle={{ x: -280 }}
          exitStyle={{ x: -280 }}
          elevate
          shadowColor="$shadowColor"
          shadowOpacity={0.2}
          shadowRadius={10}
        >
          <View paddingHorizontal="$4" paddingBottom="$2" paddingTop="$2">
            <Text fontSize="$6" fontWeight="bold">
              Menu
            </Text>
          </View>
          <Separator />
          <View tag="nav" width="100%" gap="$1" paddingHorizontal="$3" paddingTop="$2">
            {allNavigationLinks.map((link) => (
              <Link key={link.slug} href={link.href} onPress={() => onOpenChange(false)} asChild>
                <DrawerSidebarItem tag="a">
                  {link.icon && <link.icon size={20} color="$color" />}
                  <Text fontSize="$4" color="$color">
                    {link.title}
                  </Text>
                </DrawerSidebarItem>
              </Link>
            ))}
          </View>
          <Separator marginVertical="$3" />
          <View paddingHorizontal="$4">
            <ProfileButton />
          </View>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer>
  )
}

const DrawerSidebarItem = styled(View, {
  paddingVertical: '$3',
  paddingHorizontal: '$4',
  flexDirection: 'row',
  gap: '$3',
  alignItems: 'center',
  borderRadius: '$2',
  hoverStyle: { backgroundColor: '$backgroundHover' },
  pressStyle: { backgroundColor: '$backgroundPress' },
})

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
        // Add border properties here
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Button
          icon={<ArrowLeft size="$1.5" />}
          onPress={() => {
            onSetSearchActiveSm(false)
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

  // Default UI
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
      // Add border properties here
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      <XStack alignItems="center" gap="$2.5">
        {!isScreenSm && onToggleSidebarExpand && (
          <Button
            circular
            chromeless
            onPress={onToggleSidebarExpand}
            icon={<Menu size="$2" />}
            size="$3.5"
            marginLeft="$2.5"
          />
        )}
        {showTopBarLogo && (
          <Link
            href="/"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '$2' }}
          >
            <XStack alignItems="center" gap="$0">
              <VidreamIcon/>
              <Text fontSize="$6" fontWeight="bold" color="$color" paddingBottom="$1">
                Vidream
              </Text>
            </XStack>
          </Link>
        )}
      </XStack>

      {!isScreenSm && (
        <View flex={1} alignItems="center" justifyContent="center" paddingHorizontal="$4">
          <Button theme="alt1" icon={<Search />} chromeless width="60%" $maxWidth={500}>
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
