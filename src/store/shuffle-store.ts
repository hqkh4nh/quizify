import { create } from 'zustand'

const STORAGE_KEY = 'quizify-shuffle'

interface PersistedShuffle {
  shuffleQuestions: boolean
  shuffleAnswers: boolean
}

const DEFAULTS: PersistedShuffle = {
  shuffleQuestions: false,
  shuffleAnswers: false,
}

function getInitial(): PersistedShuffle {
  if (typeof localStorage === 'undefined') return DEFAULTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<PersistedShuffle>
    return {
      shuffleQuestions: parsed.shuffleQuestions === true,
      shuffleAnswers: parsed.shuffleAnswers === true,
    }
  } catch {
    // Ignore unreadable/corrupt storage; fall back to defaults.
    return DEFAULTS
  }
}

function persist(state: PersistedShuffle) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage failures (e.g. private mode).
  }
}

interface ShuffleState extends PersistedShuffle {
  toggleQuestions: () => void
  toggleAnswers: () => void
}

export const useShuffleStore = create<ShuffleState>((set, get) => ({
  ...getInitial(),
  toggleQuestions: () => {
    const next = { ...stateOf(get()), shuffleQuestions: !get().shuffleQuestions }
    persist(next)
    set({ shuffleQuestions: next.shuffleQuestions })
  },
  toggleAnswers: () => {
    const next = { ...stateOf(get()), shuffleAnswers: !get().shuffleAnswers }
    persist(next)
    set({ shuffleAnswers: next.shuffleAnswers })
  },
}))

function stateOf(s: ShuffleState): PersistedShuffle {
  return {
    shuffleQuestions: s.shuffleQuestions,
    shuffleAnswers: s.shuffleAnswers,
  }
}
