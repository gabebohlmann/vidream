// packages/app/features/navigation/TopTabNavBar.web.tsx
'use client'
import { Bell, Menu, Plus, Search, ArrowLeft } from '@tamagui/lucide-icons'
import type { GetProps } from 'tamagui'
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
} from 'tamagui'
// ... other imports from your file
import VidreamIcon from '@my/ui/src/components/VidreamIcon'
import { Link } from 'solito/link'
import { ProfileButton } from './ProfileButton.web'
import { useConvexAuth } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { allNavigationLinks } from './commonLinks'
import type { NavLinkInfo } from './commonLinks'
import { Drawer } from './Drawer'

// Props for TopTabNavBar
interface TopTabNavBarProps {
  isScreenSm: boolean
  isSearchActiveSm: boolean
  onSetSearchActiveSm: (active: boolean) => void
  onSearchSubmit?: (query: string) => void
  isSidebarExpanded?: boolean // New optional prop
}

// ... (SmallScreenDrawerContent and DrawerSidebarItem remain the same from your file)
function SmallScreenDrawerContent({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  // ... (your existing code for SmallScreenDrawerContent)
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Drawer.Content
          paddingVertical="$4"
          width={280} // Slightly wider for SM drawer
          alignItems="flex-start"
          backgroundColor="$background"
          borderRightWidth={isWeb ? 0 : 1} // No border if it's an overlay drawer on web
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
  // Similar to SidebarButton in PersistentSidebar but might have different styling/props for drawer context
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
  isSidebarExpanded, // Destructure new prop
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

  // Determine if the TopBar logo should be visible
  // Hide if not SM screen AND sidebar is expanded
  const showTopBarLogo = isScreenSm || !isSidebarExpanded

  if (isScreenSm && isSearchActiveSm) {
    // ... (SM Search Active UI - no changes here from your latest version)
    return (
      <View
        flexDirection="row"
        paddingHorizontal="$2"
        paddingVertical="$2"
        width="100%"
        alignItems="center"
        backgroundColor="$background"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        minHeight={70} //Corrected from 60 in your previous version as it was in the diff
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

  return (
    <View
      flexDirection="row"
      paddingHorizontal="$3"
      paddingVertical="$2.5"
      width="100%"
      tag="nav"
      alignItems="center"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      minHeight={60}
    >
      <View flexDirection="row" alignItems="center" gap={isScreenSm ? '$2' : '$2.5'}>
        {isScreenSm && (
          <Button
            circular
            chromeless
            onPress={toggleSmDrawer}
            icon={<Menu size="$1.5" />}
            size="$3.5"
          />
        )}
        {/* Conditionally show TopBar Logo/Title */}
        {showTopBarLogo && (!isScreenSm || (isScreenSm && !isSearchActiveSm)) && (
          <Link
            href="/"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '$2' }}
          >
            <View flexDirection="row" alignItems="center" gap="$0">
              <VidreamIcon />
              <Text fontSize="$6" fontWeight="bold" color="$color">
                Vidream
              </Text>
            </View>
          </Link>
        )}
      </View>

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
        marginLeft={!isScreenSm ? 'auto' : '$0'}
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
