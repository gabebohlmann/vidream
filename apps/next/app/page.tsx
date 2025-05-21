// apps/next/app/page.tsx
'use client'
import HomeScreen from 'app/features/home/screen'
import NavBarDrawer from '@my/ui/src/components/NavBarDrawer'
import { View } from '@my/ui'

// export default HomeScreen
export default function HomePage() {
  return (
    <View>
      <NavBarDrawer />
      <HomeScreen />
    </View>
  )
}
