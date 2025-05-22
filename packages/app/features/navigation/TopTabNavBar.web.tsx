// packages/app/features/navigation/TopTabNavBar.web.tsx
// Top Navbar with Swippable Drawer on Smaller Screens from Tamagui Bento
'use client'
import { Bell, Menu, Plus } from '@tamagui/lucide-icons'
import type { StackProps, TabLayout, TabsTabProps } from '@my/ui'
import { useEffect, useState } from 'react'
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
import { ProfileButton } from './ProfileButton.web'
import { SquarePlay } from '@tamagui/lucide-icons'
import VidreamIcon from '@my/ui/src/components/VidreamIcon'
import { Link } from 'solito/link'
import { useConvexAuth } from 'convex/react'
import { useUser } from '@clerk/nextjs'
// how to use with URL params:
// import { createParam } from 'solito'
// const { useParam, useParams } = createParam()

const links = [
  {
    title: 'Home',
    slug: 'home',
  },
  {
    title: 'Flashes',
    slug: 'flashes',
  },
  {
    title: 'Subscriptions',
    slug: 'subscriptions',
  },
]

const useTabs = () => {
  const [tabState, setTabState] = useState<{
    currentTab: string
    intentAt: TabLayout | null
    activeAt: TabLayout | null
    prevActiveAt: TabLayout | null
  }>({
    activeAt: null,
    currentTab: 'tab1', // Consider initializing from URL or a default
    intentAt: null,
    prevActiveAt: null,
  })
  const setCurrentTab = (currentTab: string) => setTabState((prev) => ({ ...prev, currentTab }))
  const setIntentIndicator = (intentAt: TabLayout | null) =>
    setTabState((prev) => ({ ...prev, intentAt }))
  const setActiveIndicator = (activeAt: TabLayout | null) =>
    setTabState((prev) => ({ ...prev, prevActiveAt: prev.activeAt, activeAt }))
  const { activeAt, intentAt, currentTab, prevActiveAt } = tabState // Added prevActiveAt to destructuring

  const handleOnInteraction: TabsTabProps['onInteraction'] = (type, layout) => {
    if (type === 'select') {
      setActiveIndicator(layout)
    } else {
      setIntentIndicator(layout)
    }
  }
  // Example: Sync with URL (if using solito or similar)
  // const { params, setParams } = useParams()
  // useEffect(() => {
  //   if (params.tab && params.tab !== currentTab) {
  //     setCurrentTab(params.tab)
  //   }
  // }, [params.tab, currentTab])
  // useEffect(() => {
  //  // To set the tab in URL if it changes internally
  //  if (currentTab && currentTab !== params.tab) {
  //    setParams({ tab: currentTab }, { replace: true })
  //  }
  // }, [currentTab, params.tab, setParams])

  return {
    currentTab,
    setCurrentTab,
    activeAt,
    intentAt,
    prevActiveAt, // Added
    handleOnInteraction,
  }
}

interface NavBarDrawerProps {
  isSignedIn?: boolean
}

export function TopTabNavBar() {
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth()
  const { user, isSignedIn } = useUser() //
  const isAuthenticated = isConvexAuthenticated && isSignedIn && user
  const { currentTab, setCurrentTab, activeAt, intentAt, handleOnInteraction } = useTabs()
  // Removed triggerOpen, setTriggerOpen, closeTrigger state as it's now in ProfileButton
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
      // Consider making height more dynamic or theme-based if 610/800 is too rigid
      // height={610}
      // $gtXs={{ height: 800 }}
      $sm={{ pb: '$4' }} // Add some padding at the bottom for smaller screens if content gets cut
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
          <Text paddingLeft="$2" fontSize="$7" fontWeight="bold">
            Vidream
          </Text>
        </View>
        {!sm && (
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            orientation="horizontal"
            flex={1} // Allow tabs to take available space if needed
            justifyContent="center" // Center the tabs list
          >
            <View flexDirection="column">
              <AnimatePresence>
                {intentAt && (
                  <TabsRovingIndicator
                    borderRadius="$4"
                    width={intentAt.width}
                    height={intentAt.height}
                    x={intentAt.x}
                    y={intentAt.y}
                  />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {activeAt && (
                  <TabsRovingIndicator
                    borderRadius="$4"
                    theme="active" // This should apply active styles from your theme
                    width={activeAt.width}
                    height={activeAt.height}
                    x={activeAt.x}
                    y={activeAt.y}
                  />
                )}
              </AnimatePresence>
              <Tabs.List
                disablePassBorderRadius
                loop={false}
                aria-label="Main navigation"
                gap="$3"
                backgroundColor="transparent"
                paddingVertical="$1" // Add some vertical padding for the indicators
              >
                {links.map(
                  (
                    link // Index not needed if title is unique for key
                  ) => (
                    <Tabs.Tab
                      key={link.slug} // Use slug for key as it's likely more stable
                      unstyled
                      value={link.slug}
                      onInteraction={handleOnInteraction}
                      paddingHorizontal="$3" // Reduced padding a bit for a tighter look
                      paddingVertical="$2"
                    >
                      <Link
                        // href={`/bento/shells/navbars/${link.slug}`} // Correct href
                        href={`/${link.slug}`} // Placeholder
                      >
                        <Text>{link.title}</Text>
                      </Link>
                    </Tabs.Tab>
                  )
                )}
              </Tabs.List>
            </View>
          </Tabs>
        )}
        {/* Right corner buttons */}
        <View flexDirection="row" alignItems="center" gap="$3">
          {/* Conditionally rendered Create Button */}
          <Button size="$3" onPress={handleCreatePress} icon={<Plus size="$1" />}></Button>
          {isAuthenticated && (
            <Button circular chromeless padding="$0" size="$3">
              <Button.Icon>
                <Bell size="$1" strokeWidth={2} />
              </Button.Icon>
            </Button>
          )}
          {!sm && <ProfileButton />}
        </View>
      </View>
    </View>
  )
}

// No changes below this line in NavBarDrawer.tsx for this refactor,
// but ensure DropDownItem and DropDownText are removed if they were here.
// NavLink, SideBar, SideBarContent, TabsRovingIndicator remain.

interface NavLinkProps extends GetProps<typeof View> {
  href: string
  children: React.ReactNode
}

const NavLink = View.styleable<NavLinkProps>(({ children, href = '#', ...rest }, ref) => {
  return (
    <View
      ref={ref}
      // borderRadius={5} // The parent Tabs.Tab or TabsRovingIndicator handles visuals primarily
      paddingVertical="$1" // Adjusted padding
      alignItems="center"
      justifyContent="center"
      {...rest}
    >
      <Link href={href}>
        <Text
          // opacity={0.9} // Handled by theme or direct color
          fontSize="$4" // Consider using slightly smaller for nav items unless it's a design choice
          fontWeight="$5"
          // lineHeight="$5" // Usually inherited or set on Text directly
          color="$color" // Use themed color, $color12 is very strong
          hoverStyle={{
            // opacity: 1, // Use color change for hover if preferred
            color: '$colorHover',
          }}
          // Example for active state (would need to pass currentTab and compare)
          // {...(isActive && { color: '$colorFocus', fontWeight: '700' })}
        >
          {children}
        </Text>
      </Link>
    </View>
  )
})

/** SIDEBAR */
function SideBar() {
  const [open, setOpen] = useState(false)
  const toggle = useEvent(() => setOpen(!open))
  // console.log(Menu); // Optional: You can log Menu here to inspect its type during development
  return (
    <View
      flexDirection="row"
      {...(isWeb && {
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            setOpen(false)
          }
        },
      })}
    >
      <Button
        circular
        chromeless
        onPress={toggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        // Pass the icon as a JSX element to the 'icon' prop directly.
        // This approach is generally more stable and less prone to issues
        // compared to nesting Button.Icon for simple icon buttons.
        icon={<Menu size="$1.5" />}
      >
        {/* No Button.Icon or children needed here if it's just an icon button */}
      </Button>
      <SideBarContent open={open} onOpenChange={() => setOpen(false)} />
    </View>
  )
}

function SideBarContent({ onOpenChange, open }: { onOpenChange: () => void; open: boolean }) {
  const { activeAt, currentTab, handleOnInteraction, intentAt, setCurrentTab } = useTabs()
  const { height, width } = useWindowDimensions()

  return (
    <View
      flexDirection="column"
      position="absolute"
      // These negative margins might need adjustment based on parent padding
      marginHorizontal={-12}
      marginVertical="$-2"
      zIndex={1000} // Ensure sidebar content is above other elements
    >
      <Drawer open={open} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay
            // height={height} // Drawer.Overlay usually fills its portal
            // width={width + 100} // This might be too specific
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          {/* Removed Drawer.Swipeable, Drawer.Content seems to handle swipe by default if native */}
          {/* If custom swipeable behavior is needed, you might need to reconsider how it's structured */}
          {/* For web, it's more about the visual presentation of the drawer */}
          <Drawer.Content
            paddingVertical="$4" // Increased padding
            // height={height} // Let content define height, or use fractions like '80%'
            width={260} // Slightly wider for better readability
            alignItems="flex-start"
            justifyContent="flex-start"
            backgroundColor="$background"
            borderRightWidth={1}
            borderRightColor="$borderColor"
            // x={-30} // These x positions and paddingLeft might be fighting each other
            // paddingLeft={30}
            gap="$4"
            elevate // Add elevation
            animation="medium" // Use a standard animation token
            enterStyle={{ x: isWeb ? -260 : '-100%' }} // Adjust for web vs native if needed
            exitStyle={{ x: isWeb ? -260 : '-100%' }}
          >
            <View
              flexDirection="row"
              padding="$2"
              marginTop="$2"
              alignItems="center"
              backgroundColor="$backgroundFocus" // Themed
              borderRadius="$10" // Themed
              marginLeft="$4" // Consistent margin
            >
              <Image
                resizeMode="contain"
                width={30}
                height={30}
                // $sm styles are not needed if this sidebar is only for sm screens
                // source={{ uri: '/bento/tamagui-icon.png' }}
                alt="Bento logo"
              />
            </View>
            <Separator width="90%" alignSelf="center" />
            <View flexDirection="column" width="100%" tag="ul" gap="$1" paddingHorizontal="$2">
              <Tabs
                value={currentTab}
                onValueChange={setCurrentTab}
                orientation="vertical"
                width="100%" // Ensure Tabs takes full width
                // add flexShrink={0} if it's inside a flex container that might shrink it
              >
                <View flexDirection="column" width="100%">
                  <AnimatePresence>
                    {intentAt && (
                      <TabsRovingIndicator
                        width={intentAt.width}
                        height={intentAt.height}
                        x={intentAt.x}
                        y={intentAt.y}
                        borderRadius="$2" // Slightly less border radius for vertical tabs
                      />
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {activeAt && (
                      <TabsRovingIndicator
                        theme="active"
                        width={activeAt.width}
                        height={activeAt.height}
                        x={activeAt.x}
                        y={activeAt.y}
                        borderRadius="$2"
                      />
                    )}
                  </AnimatePresence>
                  <Tabs.List
                    disablePassBorderRadius
                    loop={false}
                    aria-label="Sidebar navigation"
                    gap="$1" // Keep small gap for vertical items
                    width="100%"
                    backgroundColor="transparent"
                  >
                    {links.map((link) => (
                      <Tabs.Tab
                        key={link.slug}
                        unstyled
                        width="100%"
                        value={link.slug}
                        onInteraction={handleOnInteraction}
                        paddingVertical="$2" // Ensure enough tappable area
                        paddingHorizontal="$3"
                        // alignItems="flex-start" // Handled by NavLink
                        // justifyContent="flex-start" // Handled by NavLink
                      >
                        <NavLink
                          href={`#`} // Placeholder
                          // href={`/bento/shells/navbars/${link.slug}`} // Correct href
                          // paddingHorizontal="$5" // NavLink can handle its own padding or inherit
                          // marginRight="auto" // NavLink will take full width due to Tabs.Tab width="100%"
                          justifyContent="flex-start" // Align text to the start
                          width="100%" // Ensure NavLink fills the Tab
                        >
                          <Text>{link.title}</Text>
                        </NavLink>
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>
                </View>
              </Tabs>
            </View>
          </Drawer.Content>
          {/* </Drawer.Swipeable> */}
        </Drawer.Portal>
      </Drawer>
    </View>
  )
}

const TabsRovingIndicator = ({ active, ...props }: { active?: boolean } & StackProps) => {
  return (
    <View
      // flexDirection="column" // Not needed, it's an indicator
      position="absolute"
      backgroundColor={active ? '$colorFocus' : '$color'} // More thematic
      opacity={active ? 0.7 : 0.4} // Adjust opacity based on active state
      animation="100ms"
      enterStyle={{
        opacity: 0,
      }}
      exitStyle={{
        opacity: 0,
      }}
      // Removed duplicate active handling as it's now in backgroundColor/opacity
      {...props}
    />
  )
}
