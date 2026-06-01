import { create } from 'zustand'
import type { AnswerMap, Quiz } from '@/types/quiz'
import { scoreQuiz, type ScoreResult } from '@/lib/score'
import { shuffleQuiz } from '@/lib/shuffle'
import { useShuffleStore } from '@/store/shuffle-store'

export type Phase = 'upload' | 'quiz' | 'results'

interface QuizState {
  phase: Phase
  quiz: Quiz | null
  currentIndex: number
  answers: AnswerMap

  loadQuiz: (quiz: Quiz) => void
  selectAnswer: (questionId: string, optionId: string) => void
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

  loadQuiz: (quiz) => {
    // Apply the user's shuffle preferences once, here, so the resulting order
    // is stable for the whole take (navigating never re-shuffles). Read the
    // shuffle store imperatively to avoid reactive coupling between stores.
    const { shuffleQuestions, shuffleAnswers } = useShuffleStore.getState()
    const ordered = shuffleQuiz(quiz, {
      questions: shuffleQuestions,
      answers: shuffleAnswers,
    })
    set({ quiz: ordered, phase: 'quiz', currentIndex: 0, answers: {} })
  },

  selectAnswer: (questionId, optionId) => {
    const { quiz, answers } = get()
    const question = quiz?.questions.find((q) => q.id === questionId)
    if (!question) return

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

    set({ answers: { ...answers, [questionId]: nextSelection } })
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
    set({ phase: 'upload', quiz: null, currentIndex: 0, answers: {} }),

  getScore: () => {
    const { quiz, answers } = get()
    return quiz ? scoreQuiz(quiz, answers) : null
  },
}))
