import { create } from 'zustand'

export type RevealStyle = 'check' | 'auto'

const STORAGE_KEY = 'quizify-reveal'

interface PersistedReveal {
  revealEnabled: boolean
  revealStyle: RevealStyle
  lockAfterReveal: boolean
}

const DEFAULTS: PersistedReveal = {
  revealEnabled: false,
  revealStyle: 'check',
  lockAfterReveal: true,
}

function getInitial(): PersistedReveal {
  if (typeof localStorage === 'undefined') return DEFAULTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<PersistedReveal>
    return {
      revealEnabled: parsed.revealEnabled === true,
      revealStyle: parsed.revealStyle === 'auto' ? 'auto' : 'check',
      // Lock defaults to true; only an explicit false disables it.
      lockAfterReveal: parsed.lockAfterReveal !== false,
    }
  } catch {
    // Ignore unreadable/corrupt storage; fall back to defaults.
    return DEFAULTS
  }
}

function persist(state: PersistedReveal) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage failures (e.g. private mode).
  }
}

interface RevealState extends PersistedReveal {
  setRevealEnabled: (value: boolean) => void
  setRevealStyle: (value: RevealStyle) => void
  setLockAfterReveal: (value: boolean) => void
}

function snapshot(s: RevealState): PersistedReveal {
  return {
    revealEnabled: s.revealEnabled,
    revealStyle: s.revealStyle,
    lockAfterReveal: s.lockAfterReveal,
  }
}

export const useRevealStore = create<RevealState>((set, get) => ({
  ...getInitial(),
  setRevealEnabled: (value) => {
    const next = { ...snapshot(get()), revealEnabled: value }
    persist(next)
    set({ revealEnabled: value })
  },
  setRevealStyle: (value) => {
    const next = { ...snapshot(get()), revealStyle: value }
    persist(next)
    set({ revealStyle: value })
  },
  setLockAfterReveal: (value) => {
    const next = { ...snapshot(get()), lockAfterReveal: value }
    persist(next)
    set({ lockAfterReveal: value })
  },
}))
