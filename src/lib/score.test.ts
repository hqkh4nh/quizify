import { describe, it, expect } from 'vitest'
import { scoreQuiz } from './score'
import type { Quiz } from '@/types/quiz'

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
        { id: 'q1-o2', text: 'Y' },
      ],
      correctIds: ['q1-o0', 'q1-o2'],
    },
  ],
}

describe('scoreQuiz', () => {
  it('marks a correct single-answer question', () => {
    const score = scoreQuiz(quiz, { q0: ['q0-o1'], q1: ['q1-o0', 'q1-o2'] })
    expect(score.correctCount).toBe(2)
    expect(score.total).toBe(2)
    expect(score.results.every((r) => r.correct)).toBe(true)
  })

  it('marks a wrong single-answer choice incorrect', () => {
    const score = scoreQuiz(quiz, { q0: ['q0-o0'] })
    expect(score.results[0].correct).toBe(false)
  })

  it('requires an exact set for multi-answer (subset is incorrect)', () => {
    const score = scoreQuiz(quiz, { q1: ['q1-o0'] })
    expect(score.results[1].correct).toBe(false)
  })

  it('requires an exact set for multi-answer (superset is incorrect)', () => {
    const score = scoreQuiz(quiz, { q1: ['q1-o0', 'q1-o1', 'q1-o2'] })
    expect(score.results[1].correct).toBe(false)
  })

  it('accepts multi-answer regardless of selection order', () => {
    const score = scoreQuiz(quiz, { q1: ['q1-o2', 'q1-o0'] })
    expect(score.results[1].correct).toBe(true)
  })

  it('treats an unanswered question as incorrect', () => {
    const score = scoreQuiz(quiz, {})
    expect(score.correctCount).toBe(0)
    expect(score.results[0].selectedIds).toEqual([])
  })
})
