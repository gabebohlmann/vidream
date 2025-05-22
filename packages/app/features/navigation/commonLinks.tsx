// packages/app/features/navigation/commonLinks.tsx
import {
  Home,
  Zap, // For Flashes
  Airplay, // For Subscriptions
  LibraryBig,
  History,
  Video,
  ListVideo, // For Playlists
  Flame,
  Newspaper,
  TvMinimalPlay,
} from '@tamagui/lucide-icons'
import type { ReactElement } from 'react' // Import ReactElement for clarity

// Let TypeScript infer the precise type of these icon components
// This assumes Home, Zap, etc., all share the same prop structure,
// which is typical for icons from a single library like @tamagui/lucide-icons.
type TamaguiLucideIconType = typeof Home

export interface NavLinkInfo {
  title: string
  slug: string
  href: string
  icon: TamaguiLucideIconType // Use the inferred type here
  largeIcon: ReactElement // ReactElement is more specific for JSX elements
  isPrimary?: boolean
}

export const primaryNavigationItems: NavLinkInfo[] = [
  {
    title: 'Home',
    slug: 'home',
    href: '/home',
    icon: Home, // Home is of type TamaguiLucideIconType
    largeIcon: <Home size={28} />,
    isPrimary: true,
  },
  {
    title: 'Flashes',
    slug: 'flashes',
    href: '/flashes',
    icon: Zap, // Zap is also of type TamaguiLucideIconType
    largeIcon: <Zap size={28} />,
    isPrimary: true,
  },
  {
    title: 'Trending',
    slug: 'trending',
    href: '/trending',
    icon: Flame,
    largeIcon: <Flame size={28} />,
    isPrimary: true,
  },
  {
    title: 'News',
    slug: 'news',
    href: '/news',
    icon: Newspaper,
    largeIcon: <Newspaper size={28} />,
    isPrimary: true,
  },
  {
    title: 'Subscriptions',
    slug: 'subscriptions',
    href: '/subscriptions',
    icon: TvMinimalPlay,
    largeIcon: <TvMinimalPlay size={28} />,
    isPrimary: true,
  },

  {
    title: 'Library',
    slug: 'library',
    href: '/library',
    icon: LibraryBig,
    largeIcon: <LibraryBig size={28} />,
    isPrimary: true,
  },
]

export const allNavigationLinks: NavLinkInfo[] = [
  ...primaryNavigationItems,
  {
    title: 'History',
    slug: 'history',
    href: '/history',
    icon: History,
    largeIcon: <History size={28} />,
  },
  {
    title: 'Your Videos',
    slug: 'your-videos',
    href: '/your-videos',
    icon: Video,
    largeIcon: <Video size={28} />,
  },
  {
    title: 'Playlists',
    slug: 'playlists',
    href: '/playlists',
    icon: ListVideo,
    largeIcon: <ListVideo size={28} />,
  },
]
