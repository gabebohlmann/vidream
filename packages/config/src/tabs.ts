// packages/app/config/tabs.ts
import type { LucideIcon } from '@tamagui/lucide-icons'
import type { ComponentType } from 'react'

export interface TabConfig {
  name: string
  label: string
  href: string
  icon: ComponentType
}
