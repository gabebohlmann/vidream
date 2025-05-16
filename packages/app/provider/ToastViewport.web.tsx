// packages/app/provider/ToastViewport.web.tsx
import { ToastViewport as ToastViewportOg } from '@my/ui'

export const ToastViewport = () => {
  return (
    <ToastViewportOg
      left={0}
      right={0}
      top={10}
    />
  )
}
