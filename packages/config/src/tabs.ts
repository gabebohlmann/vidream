// packages/app/config/tabs.ts
import type { ComponentType } from 'react'

interface IconProps {
  color?: string;
  size?: number;
}

export interface TabConfig {
  name: string
  label: string
  href: string
  icon: ComponentType<IconProps>
}
