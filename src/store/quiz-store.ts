import { create } from 'zustand'
import type { AnswerMap, Quiz } from '@/types/quiz'
import { scoreQuiz, type ScoreResult } from '@/lib/score'
import { shuffleQuiz } from '@/lib/shuffle'
import { useShuffleStore } from '@/store/shuffle-store'
import { useRevealStore } from '@/store/reveal-store'

export type Phase = 'upload' | 'quiz' | 'results'

/** Map of question id -> whether its answer has been revealed this take. */
export type RevealMap = Record<string, boolean>

interface QuizState {
  phase: Phase
  quiz: Quiz | null
  currentIndex: number
  answers: AnswerMap
  /** Transient per-take reveal state; reset on load/reset. */
  revealed: RevealMap

  loadQuiz: (quiz: Quiz) => void
  selectAnswer: (questionId: string, optionId: string) => void
  reveal: (questionId: string) => void
  next: () => void
  prev: () => void
  finish: () => void
  reset: () => void

  /** Derived score; safe to call any time a quiz is loaded. */
  getScore: () => ScoreResult | null
}

export const useQuizStore = create<QuizState>((set, get) => ({
  phase: 'upload',
  quiz: null,
  currentIndex: 0,
  answers: {},
  revealed: {},

  loadQuiz: (quiz) => {
    // Apply the user's shuffle preferences once, here, so the resulting order
    // is stable for the whole take (navigating never re-shuffles). Read the
    // shuffle store imperatively to avoid reactive coupling between stores.
    const { shuffleQuestions, shuffleAnswers } = useShuffleStore.getState()
    const ordered = shuffleQuiz(quiz, {
      questions: shuffleQuestions,
      answers: shuffleAnswers,
    })
    set({
      quiz: ordered,
      phase: 'quiz',
      currentIndex: 0,
      answers: {},
      revealed: {},
    })
  },

  selectAnswer: (questionId, optionId) => {
    const { quiz, answers, revealed } = get()
    const question = quiz?.questions.find((q) => q.id === questionId)
    if (!question) return

    // Once revealed, a locked question can no longer change — guard here so the
    // UI can't bypass it. Read the setting imperatively (no reactive coupling).
    const { lockAfterReveal } = useRevealStore.getState()
    if (lockAfterReveal && revealed[questionId]) return

    const current = answers[questionId] ?? []
    let nextSelection: string[]

    if (question.type === 'single') {
      // Radio behavior: selecting replaces any previous choice.
      nextSelection = [optionId]
    } else {
      // Checkbox behavior: toggle membership.
      nextSelection = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
    }

    // Under "allow changing", editing an already-revealed question clears its
    // stale feedback until it is revealed again.
    const nextRevealed =
      revealed[questionId] && !lockAfterReveal
        ? { ...revealed, [questionId]: false }
        : revealed

    set({
      answers: { ...answers, [questionId]: nextSelection },
      revealed: nextRevealed,
    })
  },

  reveal: (questionId) => {
    const { answers, revealed } = get()
    // Nothing to reveal until the taker has made a selection.
    if ((answers[questionId] ?? []).length === 0) return
    set({ revealed: { ...revealed, [questionId]: true } })
  },

  next: () => {
    const { quiz, currentIndex } = get()
    if (!quiz) return
    set({ currentIndex: Math.min(currentIndex + 1, quiz.questions.length - 1) })
  },

  prev: () => {
    const { currentIndex } = get()
    set({ currentIndex: Math.max(currentIndex - 1, 0) })
  },

  finish: () => set({ phase: 'results' }),

  reset: () =>
    set({
      phase: 'upload',
      quiz: null,
      currentIndex: 0,
      answers: {},
      revealed: {},
    }),

  getScore: () => {
    const { quiz, answers } = get()
    return quiz ? scoreQuiz(quiz, answers) : null
  },
}))
