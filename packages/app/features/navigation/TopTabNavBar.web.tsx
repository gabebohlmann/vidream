// packages/app/features/navigation/TopTabNavBar.web.tsx
// packages/app/features/navigation/TopTabNavBar.web.tsx
'use client'
import { Bell, Menu, Plus, Search, ArrowLeft } from '@tamagui/lucide-icons' // Added Search, ArrowLeft
import type { GetProps } from 'tamagui'
import React, { useEffect, useState, useRef } from 'react' // Added useRef
import {
  Button,
  Separator,
  Text,
  View,
  isWeb,
  styled,
  useEvent,
  Input, // Import Tamagui Input
  AnimatePresence, // For smoother transitions
} from 'tamagui'
import { useMedia } from '@my/ui'
import { Drawer } from './Drawer'
import { ProfileButton } from './ProfileButton.web'
import VidreamIcon from '@my/ui/src/components/VidreamIcon'
import { Link } from 'solito/link'
import { useConvexAuth } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { allNavigationLinks } from './commonLinks'
import type { NavLinkInfo } from './commonLinks'

/////////////////////////////////////////////////////////////////

// Props for TopTabNavBar
interface TopTabNavBarProps {
  isScreenSm: boolean
  // Props to control SM search mode from parent
  isSearchActiveSm: boolean
  onSetSearchActiveSm: (active: boolean) => void
  onSearchSubmit?: (query: string) => void // Optional: if search is submitted from here
}

// Simplified SidebarItem for the SM Drawer (or use a shared one)
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

// ... (SmallScreenDrawerContent and DrawerSidebarItem remain the same)
function SmallScreenDrawerContent({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  // const { currentTab, setCurrentTab, activeAt, intentAt, handleOnInteraction } = useTabs() // If using Tabs in drawer

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

export function TopTabNavBar({
  isScreenSm,
  isSearchActiveSm,
  onSetSearchActiveSm,
  onSearchSubmit,
}: TopTabNavBarProps) {
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth()
  const { user, isSignedIn } = useUser()
  const isAuthenticated = isConvexAuthenticated && isSignedIn && user

  const [smDrawerOpen, setSmDrawerOpen] = useState(false)
  const toggleSmDrawer = useEvent(() => setSmDrawerOpen(!smDrawerOpen))

  const [searchQuerySm, setSearchQuerySm] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null) // Tamagui Input ref type might differ

  const handleCreatePress = () => {
    console.log('Create button pressed')
  }

  
  // Effect to focus input when SM search becomes active
  useEffect(() => {
    if (isScreenSm && isSearchActiveSm) {
      setTimeout(() => {
        // Timeout helps ensure element is rendered and ready for focus
        searchInputRef.current?.focus()
      }, 50)
    }
  }, [isScreenSm, isSearchActiveSm])

  const handleSmSearchSubmit = () => {
    if (onSearchSubmit) {
      onSearchSubmit(searchQuerySm)
    }
    // Potentially close search and clear query, or navigate to results
    // onSetSearchActiveSm(false);
  }

  // SM Screen Search Active UI
  if (isScreenSm && isSearchActiveSm) {
    return (
      <View
        flexDirection="row"
        paddingHorizontal="$2" // Reduced padding for search mode
        paddingVertical="$2" // Reduced padding
        width="100%"
        alignItems="center"
        backgroundColor="$background"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        minHeight={70}
      >
        <Button
          icon={<ArrowLeft size="$1.5" />} // Standard back icon size
          onPress={() => {
            onSetSearchActiveSm(false)
            setSearchQuerySm('') // Clear search query on back
          }}
          chromeless
          circular
          size="$3" // Consistent button sizing
          marginRight="$2"
        />
        <Input
          ref={searchInputRef as any} // Cast if specific Tamagui input ref type is needed
          flex={1}
          size="$3.5" // Match common input sizes
          placeholder="Search Vidream..."
          value={searchQuerySm}
          onChangeText={setSearchQuerySm}
          onSubmitEditing={handleSmSearchSubmit}
          // autoFocus // Handled by useEffect for more reliability
          borderRadius="$3"
        />
        {searchQuerySm.length > 0 && (
          <Button
            icon={<Plus size="$1" style={{ transform: [{ rotate: '45deg' }] }} />} // "X" icon
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

  // Default UI (SM screen, search not active OR Not SM screen)
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
      {/* Left Section: Hamburger (SM only, if not search active) & Logo */}
      <View flexDirection="row" alignItems="center" gap={isScreenSm ? '$2' : '$2.5'}>
        {isScreenSm && ( // Hamburger for SM drawer
          <Button
            circular
            chromeless
            onPress={toggleSmDrawer}
            icon={<Menu size="$1.5" />}
            size="$3.5"
          />
        )}
        {/* Logo - adjusted visibility slightly */}
        {(!isScreenSm || (isScreenSm && !isSearchActiveSm)) && (
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

      {/* Center Section: Search Bar (Not SM only) */}
      {!isScreenSm && (
        <View flex={1} alignItems="center" justifyContent="center" paddingHorizontal="$4">
          <Button theme="alt1" icon={<Search />} chromeless width="60%" $maxWidth={500}>
            Search...
          </Button>
        </View>
      )}

      {/* On SM screens, this space is now dynamic based on isSearchActiveSm */}
      {isScreenSm && <View flex={1} /> /* Spacer to push right items */}

      {/* Right Section: Action Buttons */}
      <View
        flexDirection="row"
        alignItems="center"
        gap="$2.5"
        marginLeft={!isScreenSm ? 'auto' : '$0'} // 'auto' only if not SM to push right
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

      {/* Drawer for SM screens (only if not in search mode) */}
      {isScreenSm && (
        <SmallScreenDrawerContent open={smDrawerOpen} onOpenChange={setSmDrawerOpen} />
      )}
    </View>
  )
}