// packages/app/features/navigation/TopTabNavBar.web.tsx
'use client'
import { Bell, Menu, Plus, Search, ArrowLeft, ChevronRight } from '@tamagui/lucide-icons' // Added ChevronRight
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
  YStack, // Added YStack for drawer content layout
} from 'tamagui'
import VidreamIcon from '@my/ui/src/components/VidreamIcon'
import { Link } from 'solito/link'
import { ProfileButton } from './ProfileButton.web'
import { useConvexAuth } from 'convex/react'
import { useUser } from '@clerk/nextjs'
// Updated imports from commonLinks
import {
  rootLinks,
  allSidebarSections, // Using this for a more comprehensive drawer
} from './commonLinks'
import type { NavLinkInfo } from './commonLinks'
import { Drawer } from './Drawer'

interface TopTabNavBarProps {
  isScreenSm: boolean;
  isSearchActiveSm: boolean;
  onSetSearchActiveSm: (active: boolean, targetHref?: string | null) => void; // Keep signature from previous fix
  onSearchSubmit?: (query: string) => void;
  onToggleSidebarExpand?: () => void;
}

// Styled item for the drawer
const DrawerItem = styled(XStack, {
  name: 'DrawerItem',
  tag: 'a', // For Link asChild
  width: '100%',
  paddingVertical: '$3',
  paddingHorizontal: '$3.5', // A bit more padding for drawer items
  gap: '$3.5',
  alignItems: 'center',
  borderRadius: '$3',
  hoverStyle: { backgroundColor: '$backgroundHover' },
  pressStyle: { backgroundColor: '$backgroundPress' },
  // Add active variant if needed, though drawer usually just navigates
});

const DrawerSubheading = styled(Text, {
  name: 'DrawerSubheading',
  fontWeight: 'bold',
  fontSize: '$3', // Slightly smaller than sidebar subheading for drawer context
  color: '$color',
  paddingVertical: '$2',
  paddingHorizontal: '$3.5',
  marginTop: '$2',
  width: '100%',
});


function SmallScreenDrawerContent({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const renderDrawerItem = (item: NavLinkInfo) => {
    // Handle subheadings in the drawer
    if (item.isSubheading) {
      // Linkable subheading
      if (item.href) {
        return (
          <Link
            href={item.href}
            key={item.slug}
            onPress={() => onOpenChange(false)}
            style={{ textDecoration: 'none', display: 'block', width: '100%' }}
            asChild
          >
            <DrawerItem>
              <Text fontWeight="bold" fontSize="$4" color="$colorFocus" flex={1}>{item.title}</Text>
              <ChevronRight size={18} color="$colorFocus" />
            </DrawerItem>
          </Link>
        );
      }
      // Non-linkable subheading
      return <DrawerSubheading key={item.slug}>{item.title}</DrawerSubheading>;
    }

    // Regular link item, must have href and an icon to be rendered in drawer
    if (!item.href || !item.icon) {
      return null;
    }

    return (
      <Link key={item.slug} href={item.href} onPress={() => onOpenChange(false)} asChild>
        <DrawerItem>
          <item.icon size={20} color="$color" />
          <Text fontSize="$4" color="$color" flex={1}>
            {item.title}
          </Text>
        </DrawerItem>
      </Link>
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Drawer.Content
          paddingVertical="$2" // Reduced top/bottom padding for the content itself
          width={280}
          alignItems="flex-start"
          backgroundColor="$background"
          // borderRightWidth={isWeb ? 0 : 1} // Drawer usually doesn't have right border on web
          // borderRightColor="$borderColor"
          gap="$0.5" // Smaller gap between items in the drawer
          animation="medium"
          enterStyle={{ x: -280 }}
          exitStyle={{ x: -280 }}
          elevate
          shadowColor="$shadowColor"
          shadowOpacity={0.2}
          shadowRadius={10}
        >
          <View paddingHorizontal="$3.5" paddingVertical="$3">
            <Text fontSize="$6" fontWeight="bold">
              Menu
            </Text>
          </View>
          <Separator />

          <YStack width="100%" gap="$0.5" paddingVertical="$2">
            {/* Render root links first */}
            {rootLinks.map(renderDrawerItem)}

            {/* Render sections from allSidebarSections */}
            {allSidebarSections.map((section, sectionIndex) => (
              <React.Fragment key={section.id}>
                {/* Add separator if section isn't the first one after rootLinks,
                    or if it's not flagged with noSeparatorBefore (if that flag is used consistently)
                    A simple separator between each section from allSidebarSections might be cleaner.
                */}
                {(rootLinks.length > 0 || sectionIndex > 0) && !section.links[0]?.isSubheading && (
                   <Separator marginVertical="$2.5" marginHorizontal="$3.5"/>
                )}
                {section.links.map(renderDrawerItem)}
              </React.Fragment>
            ))}
          </YStack>

          <View flex={1} /> {/* Spacer */}
          <Separator marginVertical="$2.5" marginHorizontal="$3.5"/>
          <View paddingHorizontal="$3.5" paddingBottom="$3">
            <ProfileButton />
          </View>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer>
  );
}


export function TopTabNavBar({
  isScreenSm,
  isSearchActiveSm,
  onSetSearchActiveSm,
  onSearchSubmit,
  onToggleSidebarExpand,
}: TopTabNavBarProps) {
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth();
  const { user, isSignedIn } = useUser();
  const isAuthenticated = isConvexAuthenticated && isSignedIn && user;

  const [smDrawerOpen, setSmDrawerOpen] = useState(false);
  const toggleSmDrawer = useEvent(() => setSmDrawerOpen(!smDrawerOpen));

  const [searchQuerySm, setSearchQuerySm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleCreatePress = () => {
    console.log('Create button pressed');
  };

  useEffect(() => {
    if (isScreenSm && isSearchActiveSm) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isScreenSm, isSearchActiveSm]);

  const handleSmSearchSubmit = () => {
    if (onSearchSubmit) {
      onSearchSubmit(searchQuerySm);
    }
  };

  const showTopBarLogo = (isScreenSm && !isSearchActiveSm) || !isScreenSm;

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
            onSetSearchActiveSm(false, null); // Pass null for targetHref
            setSearchQuerySm('');
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
    );
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
        {/* Hamburger for SM Drawer (Menu Icon) */}
        {isScreenSm && (
          <Button
            circular
            chromeless
            onPress={toggleSmDrawer}
            icon={<Menu size="$2" />} // Ensure this is the correct size you want
            size="$3" // Ensure this is the correct size you want
            // marginLeft="$1.5" // Present in user's code, keeping it if intended
          />
        )}
        {/* Hamburger for !SM Persistent Sidebar (Menu Icon) */}
        {!isScreenSm && onToggleSidebarExpand && (
          <Button
            circular
            chromeless
            onPress={onToggleSidebarExpand}
            icon={<Menu size="$2" />}
            size="$3"
            marginLeft="$1.5" // This was in your code for the !sm hamburger
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
        marginLeft={!isScreenSm ? 'auto' : (showTopBarLogo ? '$0' : 'auto')}
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
  );
}     