import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useThemeStore } from '@/store/theme-store'

export function Toaster(props: ToasterProps) {
  const theme = useThemeStore((s) => s.theme)

  return (
    <Sonner
      theme={theme}
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'font-sans rounded-lg border border-border bg-popover text-popover-foreground shadow-lg',
          description: 'text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}
