// apps/next/app/page.tsx
'use client'

import { Link } from 'solito/link'
import { Text } from '@my/ui'
import HomeScreen from 'app/features/home/screen'

// export default HomeScreen
export default function HomePage() {
  return <HomeScreen />
}
