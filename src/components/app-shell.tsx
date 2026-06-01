import { type ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col">
      {/* Subtle atmosphere — a faint primary glow at the top, no visual noise. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,hsl(var(--primary)/0.10),transparent_70%)]"
      />

      <header className="border-b border-border/70">
        <div className="container flex items-center justify-between py-5">
          <a href="/" className="group flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-display text-lg font-semibold text-primary-foreground shadow-sm">
              Q
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">
              Quizify
            </span>
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main className="container flex-1 py-10 sm:py-14">{children}</main>

      <footer className="border-t border-border/70">
        <div className="container flex items-center justify-center gap-2 py-5 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0" />
          <span>Private by design — your files never leave this browser.</span>
        </div>
      </footer>
    </div>
  )
}
