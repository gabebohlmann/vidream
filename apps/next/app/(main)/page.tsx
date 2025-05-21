// apps/next/app/(main)/page.tsx
'use client'
import HomeScreen from 'app/features/home/screen'
import NavBarDrawer from '@my/ui/src/components/NavBarDrawer'
import { View, Text } from '@my/ui'

// export default HomeScreen
export default function MainHomePage() {
  return (
    <View>
      {/* <HomeScreen /> */}
      <Text>Home</Text>
    </View>
  )
}
