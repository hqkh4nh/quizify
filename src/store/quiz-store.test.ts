import { describe, it, expect, beforeEach } from 'vitest'
import type { Quiz } from '@/types/quiz'
import { useQuizStore } from './quiz-store'
import { useShuffleStore } from './shuffle-store'
import { useRevealStore } from './reveal-store'

const quiz: Quiz = {
  questions: [
    {
      id: 'q0',
      type: 'single',
      question: 'single',
      options: [
        { id: 'q0-o0', text: 'A' },
        { id: 'q0-o1', text: 'B' },
      ],
      correctIds: ['q0-o1'],
    },
    {
      id: 'q1',
      type: 'multi',
      question: 'multi',
      options: [
        { id: 'q1-o0', text: 'W' },
        { id: 'q1-o1', text: 'X' },
      ],
      correctIds: ['q1-o0'],
    },
  ],
}

beforeEach(() => {
  // Keep order deterministic and start each test from a known reveal config.
  useShuffleStore.setState({ shuffleQuestions: false, shuffleAnswers: false })
  useRevealStore.setState({
    revealEnabled: true,
    revealStyle: 'check',
    lockAfterReveal: true,
  })
  useQuizStore.getState().reset()
})

describe('quiz-store reveal behavior', () => {
  it('does not reveal a question with no selection', () => {
    const store = useQuizStore.getState()
    store.loadQuiz(quiz)
    store.reveal('q0')
    expect(useQuizStore.getState().revealed['q0']).toBeFalsy()
  })

  it('reveals once a selection exists', () => {
    const store = useQuizStore.getState()
    store.loadQuiz(quiz)
    store.selectAnswer('q0', 'q0-o0')
    store.reveal('q0')
    expect(useQuizStore.getState().revealed['q0']).toBe(true)
  })

  it('locks a revealed question (selection cannot change)', () => {
    useRevealStore.setState({ lockAfterReveal: true })
    const store = useQuizStore.getState()
    store.loadQuiz(quiz)
    store.selectAnswer('q0', 'q0-o0')
    store.reveal('q0')
    store.selectAnswer('q0', 'q0-o1') // ignored while locked
    const state = useQuizStore.getState()
    expect(state.answers['q0']).toEqual(['q0-o0'])
    expect(state.revealed['q0']).toBe(true)
  })

  it('allow-changing: editing clears the reveal and updates the answer', () => {
    useRevealStore.setState({ lockAfterReveal: false })
    const store = useQuizStore.getState()
    store.loadQuiz(quiz)
    store.selectAnswer('q0', 'q0-o0')
    store.reveal('q0')
    store.selectAnswer('q0', 'q0-o1') // allowed; clears stale feedback
    const state = useQuizStore.getState()
    expect(state.answers['q0']).toEqual(['q0-o1'])
    expect(state.revealed['q0']).toBe(false)
  })

  it('resets reveal state when a new quiz is loaded', () => {
    const store = useQuizStore.getState()
    store.loadQuiz(quiz)
    store.selectAnswer('q0', 'q0-o0')
    store.reveal('q0')
    store.loadQuiz(quiz)
    expect(useQuizStore.getState().revealed).toEqual({})
  })

  it('score still derives from recorded answers regardless of reveal', () => {
    const store = useQuizStore.getState()
    store.loadQuiz(quiz)
    store.selectAnswer('q0', 'q0-o1') // correct
    store.reveal('q0')
    store.selectAnswer('q1', 'q1-o0') // correct
    const score = useQuizStore.getState().getScore()
    expect(score?.correctCount).toBe(2)
  })
})
