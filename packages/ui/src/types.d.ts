// packages/ui/src/types.d.ts
import { config } from '@my/config'

export type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
