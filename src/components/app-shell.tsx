import { type ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between py-5">
          <a href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground">
              Q
            </span>
            <span className="text-xl font-semibold tracking-tight">Quizify</span>
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main className="container flex-1 py-10 sm:py-14">{children}</main>

      <footer className="border-t border-border">
        <div className="container flex items-center justify-center gap-2 py-5 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0" />
          <span>Files are read in your browser and never uploaded.</span>
        </div>
      </footer>
    </div>
  )
}
