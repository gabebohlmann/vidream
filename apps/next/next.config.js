// apps/next/next.config.js
/** @type {import('next').NextConfig} */
const { withTamagui } = require('@tamagui/next-plugin')
const { join, resolve: pathResolve } = require('node:path') // Import path.resolve

const boolVals = {
  true: true,
  false: false,
}

const disableExtraction =
  boolVals[process.env.DISABLE_EXTRACTION] ?? process.env.NODE_ENV === 'development'

const plugins = [
  withTamagui({
    config: '../../packages/config/src/tamagui.config.ts',
    components: ['tamagui', '@my/ui'],
    appDir: true,
    importsWhitelist: ['constants.js', 'colors.js'],
    outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
    logTimings: true,
    disableExtraction,
    shouldExtract: (path) => {
      if (path.includes(join('packages', 'app'))) {
        return true
      }
    },
    disableThemesBundleOptimize: true,
    excludeReactNativeWebExports: ['Switch', 'ProgressBar', 'Picker', 'CheckBox', 'Touchable'],
  }),
]

module.exports = () => {
  /** @type {import('next').NextConfig} */
  let baseConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    transpilePackages: [
      'solito',
      'react-native-web',
      'expo-linking',
      'expo-constants',
      'expo-modules-core',
      // If your 'convex' folder is a separate package that needs transpilation, add its name here.
      // If it's just a folder of TS/JS files at the root, aliasing is the main part.
    ],
    experimental: {
      scrollRestoration: true,
    },
  }

  // Apply plugins
  for (const plugin of plugins) {
    baseConfig = plugin(baseConfig) // Plugins usually take config and return new config
  }

  // Add custom webpack configuration AFTER plugins
  const finalConfig = {
    ...baseConfig,
    webpack: (webpackConfig, options) => {
      // `options` includes `isServer`, `defaultLoaders`, etc.
      // Apply webpack modifications from plugins first, if any plugin modified it
      if (baseConfig.webpack) {
        webpackConfig = baseConfig.webpack(webpackConfig, options)
      }

      // Define aliases for Webpack
      // These paths are resolved from the location of this next.config.js file (apps/next/)
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@/convex': pathResolve(__dirname, '../../convex'), // MonorepoRoot/convex
        app: pathResolve(__dirname, '../../packages/app'), // MonorepoRoot/packages/app
        '@my/ui': pathResolve(__dirname, '../../packages/ui'), // MonorepoRoot/packages/ui
      }

      // If the 'convex' directory (or other aliased dirs) contains JSX/TSX that's outside
      // Next.js's default watched directories (like pages/, app/, src/) and isn't being
      // processed correctly, you might need to ensure it's included by the Babel loader.
      // Usually, for TS files, Next.js handles this well once aliased.
      // Example if needed:
      // const convexDir = pathResolve(__dirname, '../../convex');
      // webpackConfig.module.rules.push({
      //   test: /\.(js|mjs|jsx|ts|tsx)$/,
      //   include: [convexDir], // Only apply this loader to files within this directory
      //   use: options.defaultLoaders.babel, // Use Next.js's default babel loader
      // });

      return webpackConfig
    },
  }

  return finalConfig
}
// /** @type {import('next').NextConfig} */
// const { withTamagui } = require('@tamagui/next-plugin')
// const { join } = require('node:path')

// const boolVals = {
//   true: true,
//   false: false,
// }

// const disableExtraction =
//   boolVals[process.env.DISABLE_EXTRACTION] ?? process.env.NODE_ENV === 'development'

// const plugins = [
//   withTamagui({
//     config: '../../packages/config/src/tamagui.config.ts',
//     components: ['tamagui', '@my/ui'],
//     appDir: true,
//     importsWhitelist: ['constants.js', 'colors.js'],
//     outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
//     logTimings: true,
//     disableExtraction,
//     shouldExtract: (path) => {
//       if (path.includes(join('packages', 'app'))) {
//         return true
//       }
//     },
//     disableThemesBundleOptimize: true,
//     excludeReactNativeWebExports: ['Switch', 'ProgressBar', 'Picker', 'CheckBox', 'Touchable'],
//   }),
// ]

// module.exports = () => {
//   /** @type {import('next').NextConfig} */
//   let config = {
//     typescript: {
//       ignoreBuildErrors: true,
//     },
//     transpilePackages: [
//       'solito',
//       'react-native-web',
//       'expo-linking',
//       'expo-constants',
//       'expo-modules-core',
//     ],
//     experimental: {
//       scrollRestoration: true,
//     },
//   }

//   for (const plugin of plugins) {
//     config = {
//       ...config,
//       ...plugin(config),
//     }
//   }

//   return config
// }
