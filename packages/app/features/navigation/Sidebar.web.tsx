// packages/app/features/navigation/Sidebar.web.tsx
'use client'

import React from 'react' // Removed useState as it's now a prop
import { Button, View, YStack, XStack, Text, styled, AnimatePresence, Separator } from 'tamagui'
import { Link } from 'solito/link'
import { Menu, ChevronLeft } from '@tamagui/lucide-icons'
import { primaryNavigationItems, allNavigationLinks } from './commonLinks'
import type { NavLinkInfo } from './commonLinks'

const SidebarButton = styled(XStack, {
  name: 'SidebarButton',
  tag: 'a',
  paddingVertical: '$2.5',
  paddingHorizontal: '$3',
  gap: '$3',
  alignItems: 'center',
  borderRadius: '$3',
  cursor: 'pointer',
  hoverStyle: {
    backgroundColor: '$backgroundHover',
  },
  pressStyle: {
    backgroundColor: '$backgroundPress',
  },
  variants: {
    active: {
      true: {
        backgroundColor: '$backgroundFocus',
      },
    },
    collapsed: {
      true: {
        flexDirection: 'column',
        paddingHorizontal: '$1',
        paddingVertical: '$2',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        gap: '$1',
      },
    },
  } as const,
})

interface SidebarProps {
  isExpanded: boolean
  onToggleExpand: () => void
}

export function Sidebar({ isExpanded, onToggleExpand }: SidebarProps) {
  // Accept props
  // const [isExpanded, setIsExpanded] = useState(false) // Removed: State is lifted
  const currentWidth = isExpanded ? 240 : 96

  const renderNavItem = (link: NavLinkInfo, index: number) => (
    <Link key={link.slug} href={link.href} asChild>
      <SidebarButton collapsed={!isExpanded}>
        {isExpanded ? (
          <>
            <link.icon size={20} color="$color" />
            <Text fontSize="$3" color="$color" fontWeight={'500'}>
              {link.title}
            </Text>
          </>
        ) : (
          <>
            {React.cloneElement(link.largeIcon, {
              size: 24,
              color: '$color',
            })}
            <Text fontSize="$1" color="$color" textAlign="center" numberOfLines={1} ellipse>
              {link.title}
            </Text>
          </>
        )}
      </SidebarButton>
    </Link>
  )

  return (
    <YStack
      width={currentWidth}
      backgroundColor="$background"
      paddingVertical="$3"
      paddingHorizontal={isExpanded ? '$3' : '$1.5'}
      gap="$1.5"
      borderRightWidth={1}
      borderRightColor="$borderColor"
      animation="medium"
      animateOnly={['width', 'paddingHorizontal']}
      height="100vh"
      position="sticky"
      top={0}
      zIndex={50}
    >
      <XStack
        paddingHorizontal={isExpanded ? '$0' : '$0'}
        alignItems="center"
        justifyContent={isExpanded ? 'flex-start' : 'center'}
        marginBottom="$2"
        minHeight={40}
      >
        <Button
          icon={isExpanded ? <ChevronLeft /> : <Menu />}
          onPress={onToggleExpand} // Use the passed-in handler
          chromeless
          circular
          size="$3.5"
        />
        {isExpanded && (
          <Link href="/" style={{ textDecoration: 'none', marginLeft: '$3' }}>
            <Text fontSize="$6" fontWeight="bold" color="$color">
              Vidream
            </Text>
          </Link>
        )}
      </XStack>

      {primaryNavigationItems.filter((link) => link.isPrimary).map(renderNavItem)}

      <AnimatePresence>
        {isExpanded && (
          <YStack
            animation="medium"
            enterStyle={{ opacity: 0, y: -5 }}
            exitStyle={{ opacity: 0, y: -5 }}
            gap="$1.5"
          >
            <Separator marginVertical="$2" />
            {allNavigationLinks.filter((link) => !link.isPrimary).map(renderNavItem)}
          </YStack>
        )}
      </AnimatePresence>

      <View flex={1} />

      {isExpanded && (
        <View paddingHorizontal="$0" paddingBottom="$2">
          {/* Footer content */}
        </View>
      )}
    </YStack>
  )
}
