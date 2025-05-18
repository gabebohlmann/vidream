// packages/app/provider/safe-area/index.web.tsx
// instead, we just have a no-op here
// for more, see: https://solito.dev/recipes/tree-shaking

// if you need safe area hooks yourself, you can implement this yourself
// however, you may be better off using the CSS selector for env(safe-area-inset-top) on Web

// for more, see the `./use-safe-area.web.ts` file

export const SafeArea = ({ children }: { children: React.ReactElement }) => <>{children}</>
