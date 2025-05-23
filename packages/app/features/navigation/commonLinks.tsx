// packages/app/features/navigation/commonLinks.tsx
import {
  Home,
  Zap,
  TvMinimalPlay,
  Flame,
  Music4,
  Radio,
  Gamepad2,
  Folder, // Root & common icons
  ListVideo,
  Podcast,
  Clock,
  Video,
  ThumbsUp,
  History, // Library icons
  Blocks,
  Newspaper,
  ShoppingBag,
  Clapperboard,
  Trophy,
  Dumbbell,
  GraduationCap,
  Shirt,
  Utensils,
  PlaneTakeoff, // Explore icons
  Settings,
  Flag,
  CircleHelp,
  MessageSquareWarning, // Utility icons
  Users, // Example for a generic icon
} from '@tamagui/lucide-icons'
import type { ReactElement } from 'react'

type TamaguiLucideIconType = typeof Home

export interface NavLinkInfo {
  title: string
  slug: string
  href?: string
  icon?: TamaguiLucideIconType
  largeIcon?: ReactElement
  isRootLink?: boolean
  isSubheading?: boolean
}

export const rootLinks: NavLinkInfo[] = [
  {
    title: 'Home',
    slug: 'home',
    href: '/home',
    icon: Home,
    largeIcon: <Home size={28} />,
    isRootLink: true,
  },
  {
    title: 'Flashes',
    slug: 'flashes',
    href: '/flashes',
    icon: Zap,
    largeIcon: <Zap size={28} />,
    isRootLink: true,
  },
  {
    title: 'Subscriptions',
    slug: 'subscriptions_root',
    href: '/subscriptions',
    icon: TvMinimalPlay,
    largeIcon: <TvMinimalPlay size={28} />,
    isRootLink: true,
  },
  {
    title: 'Trending',
    slug: 'trending_root',
    href: '/trending',
    icon: Flame,
    largeIcon: <Flame size={28} />,
    isRootLink: true,
  },
]

const yourLibrarySectionLinks: NavLinkInfo[] = [
  { title: 'Your Library', slug: 'library_heading', href: '/library', isSubheading: true },
  { title: 'Playlists', slug: 'playlists', href: '/playlists', icon: ListVideo },
  { title: 'Your Podcasts', slug: 'your_podcasts_lib', href: '/your-podcasts', icon: Podcast },
  { title: 'Watch Later', slug: 'watch-later', href: '/watch-later', icon: Clock },
  { title: 'Your Videos', slug: 'your_videos_lib', href: '/your-videos', icon: Video },
  { title: 'Liked Videos', slug: 'liked_videos_lib', href: '/liked-videos', icon: ThumbsUp },
  { title: 'History', slug: 'history_lib', href: '/history', icon: History },
]

const subscriptionsSectionLinks: NavLinkInfo[] = [
  { title: 'Subscriptions', slug: 'subscriptions_heading', href: '/subscriptions', isSubheading: true },
  { title: 'See all', slug: 'see_all_subscriptions', href: '/subscriptions/all', icon: Users },
]

const exploreSectionLinks: NavLinkInfo[] = [
  { title: 'Explore', slug: 'explore', href: '/explore', isSubheading: true },
  { title: "Kids Content", slug: 'kids-content', href: '/kids-content', icon: Blocks },
  { title: 'News & Politics', slug: 'news-and-politics', href: '/news-and-politics', icon: Newspaper },
  { title: 'Music', slug: 'music_explore', href: '/music', icon: Music4 },
  { title: 'Movies & TV', slug: 'movies-and-tv', href: '/movies-and-tv', icon: Clapperboard },
  { title: 'Live Streams', slug: 'live_streams_explore', href: '/live-streams', icon: Radio },
  { title: 'Gaming', slug: 'gaming_explore', href: '/gaming', icon: Gamepad2 },
  { title: 'Sports', slug: 'sports', href: '/sports', icon: Trophy },
  { title: 'Shopping', slug: 'shopping', href: '/shopping', icon: ShoppingBag },
  { title: 'Fitness', slug: 'fitness', href: '/fitness', icon: Dumbbell },
  { title: 'Learning', slug: 'learning', href: '/learning', icon: GraduationCap },
  { title: 'Fashion & Beauty', slug: 'fashion-and-beauty', href: '/fashion-and-beauty', icon: Shirt },
  { title: 'Podcasts', slug: 'podcasts_explore', href: '/podcasts', icon: Podcast }, // Duplicate of library one? ensure distinct slugs if so.
  { title: 'Food', slug: 'food', href: '/food', icon: Utensils },
  { title: 'Travel', slug: 'travel', href: '/travel', icon: PlaneTakeoff },
]

const utilitySectionLinks: NavLinkInfo[] = [
  { title: 'Settings', slug: 'settings', href: '/settings', icon: Settings },
  { title: 'Report History', slug: 'report-history', href: '/report-history', icon: Flag },
  { title: 'Help', slug: 'help', href: '/help', icon: CircleHelp },
  {
    title: 'Send Feedback',
    slug: 'send-feedback',
    href: '/send-feedback',
    icon: MessageSquareWarning,
  },
]

export const allSidebarSections = [
  { id: 'librarySection', links: yourLibrarySectionLinks, noSeparatorBefore: false },
  { id: 'subscriptionsSection', links: subscriptionsSectionLinks, noSeparatorBefore: false },
  { id: 'exploreSection', links: exploreSectionLinks, noSeparatorBefore: false },
  { id: 'utilitySection', links: utilitySectionLinks, noSeparatorBefore: false }, // Example: utility might not need separator if it's last.
]
