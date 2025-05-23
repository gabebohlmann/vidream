// packages/config/src/tamagui.config.ts
import { defaultConfig } from '@tamagui/config/v4'
import { shorthands } from '@tamagui/shorthands'
import { createTokens, createTamagui, setupDev } from 'tamagui'

import { animations } from './animations'
import { bodyFont, headingFont } from './fonts'
import { media, mediaQueryDefaultActive } from './media'
import { themes as themesIn } from './themes/theme-generated'
import { color } from './themes/token-colors'
import { radius } from './themes/token-radius'
import { size } from './themes/token-size'
import { space } from './themes/token-space'
import { zIndex } from './themes/token-z-index'

// Hold down Option for a second to see some helpful visuals
setupDev({
  visualizer: true,
})

/**
 * This avoids shipping themes as JS. Instead, Tamagui will hydrate them from CSS.
 */

const themes =
  process.env.TAMAGUI_TARGET !== 'web' || process.env.TAMAGUI_IS_SERVER || process.env.STORYBOOK
    ? themesIn
    : ({} as typeof themesIn)

export const config = createTamagui({
  ...defaultConfig,
  themes,
  defaultFont: 'body',
  animations,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  mediaQueryDefaultActive,
  selectionStyles: (theme) => ({
    backgroundColor: theme.color5,
    color: theme.color11,
  }),
  onlyAllowShorthands: false,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  tokens: createTokens({
    color,
    radius,
    zIndex,
    space,
    size,
  }),
  media,
  settings: {
    allowedStyleValues: 'somewhat-strict',
    autocompleteSpecificTokens: 'except-special',
    fastSchemeChange: true,
  },
})

export default config
