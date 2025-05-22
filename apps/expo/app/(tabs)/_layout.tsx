// apps/expo/app/(tabs)/_layout.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Tabs } from 'expo-router'
import { Home, TvMinimalPlay, Flame, Film, CircleUserRound } from '@tamagui/lucide-icons'
import { TopNavBar } from 'app/features/navigation/TopNavBar.native'

export default function TabLayout() {
  return (
    <>
      <TopNavBar/>
      <Tabs screenOptions={{ tabBarActiveTintColor: 'green', headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home size={28} color={color} />,
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
            tabBarIcon: ({ color }) => <Film size={28} color={color} />,
            tabBarLabelStyle: {
              fontSize: 9,
              fontWeight: 'bold',
            },
          }}
        />
        <Tabs.Screen
          name="trending"
          options={{
            title: 'Trending',
            tabBarIcon: ({ color }) => <Flame size={28} color={color} />,
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
            tabBarIcon: ({ color }) => <TvMinimalPlay size={28} color={color} />,
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
            tabBarIcon: ({ color }) => <CircleUserRound size={28} color={color} />,
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
