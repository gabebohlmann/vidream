// apps/expo/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { Home, TvMinimalPlay, Search, Film, CircleUserRound } from '@tamagui/lucide-icons'
import { TopNavBar } from 'app/features/navigation/TopNavBar.native'
import { Pressable } from 'react-native'

const TabBarButton = (props: PressableProps) => {
  return (
    <Pressable
      {...props} // Pass down all original props (onPress, accessibilityState, children, style, etc.)
      android_ripple={{ color: 'transparent' }} // Disables the ripple effect on Android
      // For iOS, providing a style prop (even if it's just the original style)
      // overrides the default behavior of dimming/lightening the view on press.
      style={props.style}
    />
  )
}

export default function TabLayout() {
  return (
    <>
      <TopNavBar />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#138404',
          tabBarInactiveTintColor: '#FFFFFF',
          headerShown: false,
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home size={28} color={color} strokeWidth={1.5} />,
            tabBarLabelStyle: {
              fontSize: 9,
              fontWeight: 'bold',
            },
          }}
        />
        <Tabs.Screen
          name="flashes"
          options={{
            title: 'Flashes',
            tabBarIcon: ({ color }) => <Film size={28} color={color} strokeWidth={1.5} />,
            tabBarLabelStyle: {
              fontSize: 9,
              fontWeight: 'bold',
            },
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => <Search size={28} color={color} strokeWidth={1.5} />,
            tabBarLabelStyle: {
              fontSize: 9,
              fontWeight: 'bold',
            },
          }}
        />
        <Tabs.Screen
          name="subscriptions"
          options={{
            title: 'Subscriptions',
            tabBarIcon: ({ color }) => <TvMinimalPlay size={28} color={color} strokeWidth={1.5} />,
            tabBarLabelStyle: {
              fontSize: 9,
              fontWeight: 'bold',
            },
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color }) => (
              <CircleUserRound size={28} color={color} strokeWidth={1.5} />
            ),
            tabBarLabelStyle: {
              fontSize: 9,
              fontWeight: 'bold',
            },
          }}
        />
      </Tabs>
    </>
  )
}
