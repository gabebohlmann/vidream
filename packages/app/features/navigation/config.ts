// packages/app/features/navigation/config.ts
import {
  Home,
  Zap, // Original Flashes icon on web
  Film, // Used for Flashes in current Expo tabs
  TvMinimalPlay,
  Search,
  CircleUserRound,
  Upload,
  ShieldAlert,
  Flame, // For Trending (web root link)
  Folder, // For Library (web sidebar)
  ListVideo,
  Podcast,
  Clock,
  Video,
  ThumbsUp,
  History,
  Blocks,
  Newspaper,
  Music4,
  Clapperboard,
  Radio,
  Gamepad2,
  Trophy,
  Dumbbell,
  GraduationCap,
  Shirt,
  Utensils,
  PlaneTakeoff,
  Settings,
  Flag,
  CircleHelp,
  MessageSquareWarning,
  Users,
  Menu as MenuIcon, // For drawer/sidebar toggle if needed
} from '@tamagui/lucide-icons';
import type { LucideIcon } from '@tamagui/lucide-icons';
import type { ReactElement } from 'react';

/**
 * Defines a navigation item.
 * - `id`: Unique key, crucial for Expo Router file names (e.g., 'home' maps to 'home.tsx' or 'index.tsx').
 * Also used for React keys.
 * - `title`: Display title/label for the item.
 * - `href`: The primary navigation path (e.g., '/', '/flashes'). Solito <Link href={href}> will use this.
 * - `icon`: LucideIcon component for the item.
 * - `isTab`: If true, this item is considered a primary bottom tab on mobile.
 * - `isMenuOnly`: If true, this item might only appear in a drawer/sidebar menu, not as a primary tab.
 * - `requiresAuth`: If true, this item/route might be protected.
 * - `expoHref`: Expo Router specific. If `null`, screen is part of layout but not a visible tab.
 * If undefined, `href` is used by Expo Router for linking.
 * The `name` prop for Expo Router's <Tabs.Screen name="xxx"> will be derived from `id`.
 * - `webSidebarIcon`: Icon specifically for the web's expanded sidebar (can be different or sized differently).
 * - `webCollapsedSidebarIcon`: Icon for the web's collapsed sidebar.
 * - `isWebRootLink`: True if it's a main link in the web sidebar's top section.
 * - `isSubheading`: For web sidebar section titles.
 */
export interface NavItemConfig {
  id: string;
  title: string;
  href: string;
  icon?: LucideIcon;
  isTab?: boolean;
  isMenuOnly?: boolean;
  requiresAuth?: boolean;
  expoHref?: string | null; // Use `null` to hide from Expo tab bar but keep in layout
  webSidebarIcon?: LucideIcon | ReactElement; // For web sidebar (expanded)
  webCollapsedSidebarIcon?: LucideIcon | ReactElement; // For web sidebar (collapsed)
  isWebRootLink?: boolean; // For web sidebar main links (like current rootLinks)
  isSubheading?: boolean; // For web sidebar section titles
}

export interface NavSectionConfig {
  id: string;
  title?: string; // Optional title for the section (rendered if first item isn't a subheading)
  links: NavItemConfig[];
  requiresAuth?: boolean;
  noSeparatorBefore?: boolean; // For web sidebar styling
}

// 1. Main Tab Navigation Items (for Expo Bottom Tabs & Web Bottom Tabs if sm)
// The `id` should match the file name in `apps/expo/app/(tabs)/[id].tsx`
// For the root/home tab, Expo Router typically uses `index.tsx`, so `id: 'index'`
export const tabNavItems: NavItemConfig[] = [
  { id: 'index', title: 'Home', href: '/', icon: Home, isTab: true, isWebRootLink: true, webCollapsedSidebarIcon: <Home size={28}/> },
  { id: 'flashes', title: 'Flashes', href: '/flashes', icon: Film, isTab: true, isWebRootLink: true, webCollapsedSidebarIcon: <Zap size={28}/> /* Web used Zap */ },
  { id: 'search', title: 'Search', href: '/search', icon: Search, isTab: true },
  { id: 'subscriptions', title: 'Subscriptions', href: '/subscriptions', icon: TvMinimalPlay, isTab: true, isWebRootLink: true, webCollapsedSidebarIcon: <TvMinimalPlay size={28}/> },
  { id: 'account', title: 'Account', href: '/account', icon: CircleUserRound, isTab: true, requiresAuth: true },
];

// 2. Screens that are part of (tabs) layout group in Expo but not visible tabs
// Or general utility screens accessible from main navigation contexts.
export const utilityScreensNavItems: NavItemConfig[] = [
  { id: 'upload', title: 'Upload', href: '/upload', icon: Upload, requiresAuth: true, expoHref: null },
  // Add other screens like settings, video detail pages, etc., if they need to be referenced in nav contexts
  // For example, a settings screen might be linked from a profile popover or a drawer.
  { id: 'settings', title: 'Settings', href: '/settings', icon: Settings, isMenuOnly: true },
];

// 3. Authentication Screen Definitions
// These typically belong to a separate stack (e.g., (auth) group in Expo)
export const authScreenNavItems: NavItemConfig[] = [
  { id: 'sign-in', title: 'Sign In', href: '/sign-in', icon: ShieldAlert },
  { id: 'sign-up', title: 'Sign Up', href: '/sign-up', icon: ShieldAlert },
  { id: 'reset-password', title: 'Reset Password', href: '/reset-password', icon: ShieldAlert },
];

// 4. Web Sidebar / Expo Drawer Navigation Sections
// This structure is similar to your existing `allSidebarSections` and `rootLinks`
export const webSidebarRootLinks: NavItemConfig[] = [
  // These often mirror some tab items but are styled differently for the web sidebar's top section.
  { id: 'home', title: 'Home', href: '/', icon: Home, isWebRootLink: true, webCollapsedSidebarIcon: <Home size={24} />, webSidebarIcon: <Home size={20}/> },
  { id: 'flashes_sidebar', title: 'Flashes', href: '/flashes', icon: Zap, isWebRootLink: true, webCollapsedSidebarIcon: <Zap size={24} />, webSidebarIcon: <Zap size={20}/> },
  { id: 'subscriptions_sidebar', title: 'Subscriptions', href: '/subscriptions', icon: TvMinimalPlay, isWebRootLink: true, webCollapsedSidebarIcon: <TvMinimalPlay size={24} />, webSidebarIcon: <TvMinimalPlay size={20}/> },
  { id: 'trending_sidebar', title: 'Trending', href: '/trending', icon: Flame, isWebRootLink: true, webCollapsedSidebarIcon: <Flame size={24} />, webSidebarIcon: <Flame size={20}/> },
];

export const menuSections: NavSectionConfig[] = [
  {
    id: 'librarySection',
    links: [
      { id: 'library_heading', title: 'Your Library', href: '/library', isSubheading: true, icon: Folder },
      { id: 'playlists', title: 'Playlists', href: '/playlists', icon: ListVideo },
      { id: 'your_podcasts_lib', title: 'Your Podcasts', href: '/your-podcasts', icon: Podcast },
      { id: 'watch-later', title: 'Watch Later', href: '/watch-later', icon: Clock },
      { id: 'your_videos_lib', title: 'Your Videos', href: '/your-videos', icon: Video },
      { id: 'liked_videos_lib', title: 'Liked Videos', href: '/liked-videos', icon: ThumbsUp },
      { id: 'history_lib', title: 'History', href: '/history', icon: History },
    ],
    requiresAuth: true,
  },
  {
    id: 'subscriptionsSection',
    links: [
      { id: 'subscriptions_heading', title: 'Subscriptions', href: '/subscriptions/all', isSubheading: true, icon: Users },
      // Dynamically list subscriptions or link to a management page
    ],
    requiresAuth: true,
  },
  {
    id: 'exploreSection',
    title: 'Explore',
    links: [
      { id: 'kids-content', title: "Kids Content", href: '/kids-content', icon: Blocks },
      { id: 'news-and-politics', title: 'News & Politics', href: '/news-and-politics', icon: Newspaper },
      { id: 'music_explore', title: 'Music', href: '/music', icon: Music4 },
      { id: 'movies-and-tv', title: 'Movies & TV', href: '/movies-and-tv', icon: Clapperboard },
      { id: 'live_streams_explore', title: 'Live Streams', href: '/live-streams', icon: Radio },
      { id: 'gaming_explore', title: 'Gaming', href: '/gaming', icon: Gamepad2 },
      { id: 'sports', title: 'Sports', href: '/sports', icon: Trophy },
      { id: 'shopping', title: 'Shopping', href: '/shopping', icon: ShoppingBag },
      { id: 'fitness', title: 'Fitness', href: '/fitness', icon: Dumbbell },
      { id: 'learning', title: 'Learning', href: '/learning', icon: GraduationCap },
      { id: 'fashion-and-beauty', title: 'Fashion & Beauty', href: '/fashion-and-beauty', icon: Shirt },
      { id: 'podcasts_explore', title: 'Podcasts', href: '/podcasts', icon: Podcast },
      { id: 'food', title: 'Food', href: '/food', icon: Utensils },
      { id: 'travel', title: 'Travel', href: '/travel', icon: PlaneTakeoff },
    ],
  },
  {
    id: 'utilitySection',
    noSeparatorBefore: true,
    links: [
      { id: 'settings', title: 'Settings', href: '/settings', icon: Settings },
      { id: 'report-history', title: 'Report History', href: '/report-history', icon: Flag },
      { id: 'help', title: 'Help', href: '/help', icon: CircleHelp },
      { id: 'send-feedback', title: 'Send Feedback', href: '/send-feedback', icon: MessageSquareWarning },
    ],
  },
];

// Helper to get only items marked as tabs
export const getTabItems = (): NavItemConfig[] => tabNavItems.filter(item => item.isTab);

// Helper to get items for a web sidebar (combining root links and sections)
export const getWebSidebarNav = (): { roots: NavItemConfig[], sections: NavSectionConfig[] } => ({
  roots: webSidebarRootLinks,
  sections: menuSections,
});

// Helper to get items for an Expo drawer (can be similar to web sidebar or a subset)
export const getExpoDrawerNav = (): { roots: NavItemConfig[], sections: NavSectionConfig[] } => ({
  roots: webSidebarRootLinks.filter(link => link.icon), // Ensure icon exists for drawer
  sections: menuSections,
});
```
This new config file is more structured. It separates tab items, utility screens (like upload), auth screens, and sidebar/drawer sections. It also includes helper functions to retrieve specific sets of navigation items.

**Phase 2: Refactor Expo Tabs Layout**

Now, let's update `apps/expo/app/(tabs)/_layout.tsx` to use this new configuration.


```typescript
// apps/expo/app/(tabs)/_layout.tsx
import { Tabs, SplashScreen, Stack } from 'expo-router';
import { Pressable, PressableProps, useColorScheme } from 'react-native';
import { Theme } from '@my/ui'; // Assuming Theme is for theming Pressable or icons
import { tabNavItems, utilityScreensNavItems, authScreenNavItems } from 'packages/config/navigation.config'; // Adjust path as needed
import { useAuth } from '@clerk/clerk-expo'; // For checking auth status for conditional tabs

// Keep your custom TabBarButton if you like its behavior
const TabBarButton = (props: PressableProps) => {
  return (
    <Pressable
      {...props}
      android_ripple={{ color: 'transparent' }}
      style={props.style} // Pass style to ensure custom behavior or default is applied
    />
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { isSignedIn } = useAuth(); // Get Clerk's isSignedIn status

  // Filter tab items based on auth status if needed
  const visibleTabItems = tabNavItems.filter(item => {
    if (item.requiresAuth && !isSignedIn) {
      return false; // Don't show auth-required tabs if not signed in
    }
    return item.isTab; // Ensure it's marked as a tab
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#138404', // Your active color
        tabBarInactiveTintColor: isDarkMode ? '#FFFFFF' : '#000000',
        headerShown: false,
        tabBarButton: (props) => <TabBarButton {...props} />,
      }}
    >
      {visibleTabItems.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <Tabs.Screen
            key={tab.id}
            name={tab.id} // This MUST match the file name in app/(tabs)/[id].tsx (e.g., 'index.tsx', 'flashes.tsx')
            options={{
              title: tab.title,
              tabBarIcon: ({ color, focused, size }) =>
                IconComponent ? <IconComponent size={size || 28} color={color as any} strokeWidth={focused ? 2 : 1.5} /> : null,
              // href: tab.expoHref === undefined ? tab.href : tab.expoHref, // Use expoHref if defined, otherwise normal href
                                                                           // For visible tabs, href should generally not be null.
                                                                           // If you want a tab to navigate to a path different from its file name,
                                                                           // you'd typically handle that with redirects or by structuring files differently.
                                                                           // For now, relying on `name` matching file path.
            }}
          />
        );
      })}

      {/* Screens that are part of the (tabs) layout group but not visible tabs */}
      {utilityScreensNavItems.map((screen) => (
        // Only include if expoHref is explicitly null (meaning it's a screen in the layout, not a tab)
        // or if it's an auth-required screen and user is not signed in (though these are usually in their own group)
        (screen.expoHref === null) && (
          <Tabs.Screen
            key={screen.id}
            name={screen.id} // Must match file name, e.g., 'upload.tsx'
            options={{
              href: null, // Hides from tab bar
            }}
          />
        )
      ))}

      {/* Auth screens group - also hidden from tab bar */}
      <Tabs.Screen
        name="(auth)" // This refers to the app/(tabs)/(auth)/_layout.tsx group
        options={{
          href: null, // Hides from tab bar
        }}
      />
    </Tabs>
  );
}
```

**Phase 3: Refactor Web Navigation (`packages/app/features/navigation/...`)**

Your web navigation components (`WebNavigationLayout`, `BottomTabNavBar.web.tsx`, `Sidebar.web.tsx`, `TopNavBar.web.tsx`, `NavigationMenuList.tsx`) will now need to consume `navigation.config.ts` instead of `commonLinks.tsx`.

This is a more involved change as it touches several files. I'll outline the approach and provide an example for `BottomTabNavBar.web.tsx`.

**Approach for Web:**

1.  **`NavigationMenuList.tsx`**:
    * Update its props to accept `NavItemConfig[]` and `NavSectionConfig[]`.
    * Adapt its rendering logic to use the properties from `NavItemConfig` (e.g., `item.webSidebarIcon`, `item.webCollapsedSidebarIcon`).
2.  **`Sidebar.web.tsx`**:
    * Import `webSidebarRootLinks` and `menuSections` from `navigation.config.ts`.
    * Pass these to `NavigationMenuList` (or directly render if its logic is embedded).
3.  **`BottomTabNavBar.web.tsx`**:
    * Import `tabNavItems` and filter them (e.g., for `isTab: true` and not `isExpoOnlyTab`).
    * The `TabConfig` type it expects needs to be compatible with `NavItemConfig`.
4.  **`TopNavBar.web.tsx`**:
    * Its drawer content (`SmallScreenDrawerContent`) will use `webSidebarRootLinks` and `menuSections` passed to `NavigationMenuList`.
5.  **`WebNavigationLayout` (`packages/app/features/navigation/index.web.tsx`):**
    * This component orchestrates the web layout. It will import the necessary configs and pass them down to `Sidebar`, `TopTabNavBar`, and `BottomTabNavBar`.
    * It will no longer need the `tabsConfig` prop if `BottomTabNavBar` fetches its own data from the unified config.

**Example: Updating `BottomTabNavBar.web.tsx`**


```typescript
// packages/app/features/navigation/BottomTabNavBar.web.tsx
'use client';

import { Button, Text, XStack, YStack, useMedia } from 'tamagui';
import { useRouter, usePathname } from 'solito/navigation';
// Import from the new unified config
import { tabNavItems, type NavItemConfig } from 'packages/config/navigation.config'; // Adjust path
import { useAuth } from '@clerk/nextjs'; // Or your Clerk hook for web

interface CustomBottomTabBarProps {
  // tabs prop is no longer needed as we'll use the imported config
  onSearchIconPress?: () => void;
  onSetSearchActiveSm?: (active: boolean, targetHref?: string | null) => void;
  isSearchModeActive?: boolean;
  targetHrefDuringTransition?: string | null;
}

export function BottomTabNavBar({
  onSearchIconPress,
  onSetSearchActiveSm,
  isSearchModeActive,
  targetHrefDuringTransition,
}: CustomBottomTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { sm } = useMedia();
  const { isSignedIn } = useAuth(); // For web

  if (!sm) {
    // return null; // Or your desired behavior for larger screens
  }

  // Filter items for the tab bar
  const currentTabItems = tabNavItems.filter(item => {
    if (item.isExpoOnlyTab) return false; // Skip Expo-only tabs
    if (item.requiresAuth && !isSignedIn) return false;
    return item.isTab;
  });


  const handleTabPress = (tab: NavItemConfig) => {
    const isThisTheSearchTab = tab.id.toLowerCase() === 'search';

    if (isThisTheSearchTab) {
      if (onSearchIconPress) {
        onSearchIconPress();
      }
    } else {
      if (tab.href) {
        router.push(tab.href);
      }
      if (onSetSearchActiveSm) {
        onSetSearchActiveSm(false, tab.href);
      }
    }
  };

  return (
    <XStack
      height={60}
      borderTopWidth={1}
      borderTopColor="$borderColor"
      backgroundColor="$background"
      alignItems="center"
      justifyContent="space-around"
      position="fixed" // For web, bottom nav is usually fixed
      bottom={0}
      left={0}
      right={0}
      width="100%"
      zIndex={10} // Ensure it's above other content
    >
      {currentTabItems.map((tab) => {
        let pathIsActive;
        if (tab.href === '/') { // Adjusted for root path
          pathIsActive = pathname === tab.href;
        } else {
          pathIsActive = tab.href && pathname?.startsWith(tab.href);
        }

        const isThisTheSearchTab = tab.id.toLowerCase() === 'search';
        let displayActive;

        if (isThisTheSearchTab) {
          displayActive = isSearchModeActive;
        } else {
          if (targetHrefDuringTransition) {
            displayActive = tab.href === targetHrefDuringTransition;
          } else {
            displayActive = pathIsActive && !isSearchModeActive;
          }
        }
        
        const IconComponent = tab.icon;

        return (
          <Button
            key={tab.id}
            flexGrow={1}
            flexBasis={0}
            flexShrink={1}
            chromeless
            onPress={() => handleTabPress(tab)}
            paddingVertical="$2"
            pressStyle={{ backgroundColor: '$backgroundHover' }}
            minWidth={0} // Allow shrinking
            paddingHorizontal="$0" // Let YStack handle internal padding
            marginHorizontal={4} // Small margin between items
          >
            <YStack
              flex={1} // Ensure YStack fills the button
              alignItems="center"
              justifyContent="center"
              gap="$1"
              paddingHorizontal="$1" // Padding for icon and text
            >
              {IconComponent && <IconComponent color={displayActive ? '#138404' : '$color'} size={20} />}
              <Text
                fontSize={10}
                color={displayActive ? '#138404' : '$color'}
                fontWeight={displayActive ? 'bold' : 'normal'}
                textAlign="center"
                ellipse // Add ellipsis for long text
              >
                {tab.title}
              </Text>
            </YStack>
          </Button>
        );
      })}
    </XStack>
  );
}
