// packages/app/features/navigation/TopNavBar.native.tsx
// Top Navbar with Swippable Drawer on Smaller Screens from Tamagui Bento
'use client'
import { Bell, Menu, Plus } from '@tamagui/lucide-icons'
import type { StackProps, TabLayout, TabsTabProps } from '@my/ui'
import {
  Anchor,
  AnimatePresence,
  // Avatar, // Removed
  Button,
  Image,
  // Popover, // Removed
  // PopoverTrigger, // Removed
  Separator,
  Tabs,
  Text,
  View,
  isWeb,
  styled,
  useEvent,
} from 'tamagui'
import { useMedia } from '@my/ui'
import { useWindowDimensions } from 'tamagui'
import { Drawer } from './Drawer'
import { SquarePlay } from '@tamagui/lucide-icons'
import VidreamIcon from '@my/ui/src/components/VidReamIcon'
// how to use with URL params:
// import { createParam } from 'solito'
// const { useParam, useParams } = createParam()

interface NavBarDrawerProps {
  isSignedIn?: boolean
}

export function TopNavBar({ isSignedIn }: NavBarDrawerProps) {
  const { sm } = useMedia()
  const handleCreatePress = () => {
    // TODO: Implement your create action
    console.log('Create button pressed')
    // Example: navigation.navigate('/create') or open a modal
  }
  return (
    <View
      flexDirection="column"
      width="100%"
      marginTop={30}
      // Consider making height more dynamic or theme-based if 610/800 is too rigid
      // height={610}
      // $gtXs={{ height: 800 }}
      // $sm={{ pb: '$4' }} // Add some padding at the bottom for smaller screens if content gets cut
    >
      <View
        flexDirection="row"
        paddingHorizontal="$3" // Consistent padding
        paddingVertical="$2"
        minWidth="100%"
        tag="nav"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="$background"
        borderBottomWidth={1} // Optional: add a subtle border
        borderBottomColor="$borderColor" // Optional
      >
        <View flexDirection="row" alignItems="center">
          {/* <SquarePlay size={32} color="#FFFFFF" strokeWidth={2.25} fill="#1b9e0a" /> */}
          <VidreamIcon />
          <Text paddingLeft="$2" fontSize="$6" fontWeight="bold">
            Vidream
          </Text>
        </View>
        {/* Right corner buttons */}
        <View flexDirection="row" alignItems="center" gap="$3">
          {/* Conditionally rendered Create Button */}
          <Button size="$3" onPress={handleCreatePress} icon={<Plus size="$1" />}></Button>
          <Button circular chromeless padding="$0" size="$3">
            <Button.Icon>
              <Bell size="$1" strokeWidth={2} />
            </Button.Icon>
          </Button>
        </View>
      </View>
    </View>
  )
}
