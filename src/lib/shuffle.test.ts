import { describe, it, expect } from 'vitest'
import { shuffle, shuffleQuiz } from './shuffle'
import type { Quiz } from '@/types/quiz'

const quiz: Quiz = {
  title: 'Sample',
  questions: [
    {
      id: 'q0',
      type: 'single',
      question: 'single',
      options: [
        { id: 'q0-o0', text: 'A' },
        { id: 'q0-o1', text: 'B' },
        { id: 'q0-o2', text: 'C' },
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
        { id: 'q1-o3', text: 'Z' },
      ],
      correctIds: ['q1-o0', 'q1-o2'],
      explanation: 'because',
    },
  ],
}

const sorted = (xs: string[]) => [...xs].sort()
const questionIds = (q: Quiz) => q.questions.map((x) => x.id)
const optionIds = (q: Quiz, i: number) => q.questions[i].options.map((o) => o.id)

describe('shuffle', () => {
  it('does not mutate the input array', () => {
    const input = [1, 2, 3, 4, 5]
    const copy = [...input]
    shuffle(input)
    expect(input).toEqual(copy)
  })

  it('returns a permutation of the input', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(result).toHaveLength(input.length)
    expect([...result].sort()).toEqual([...input].sort())
  })
})

describe('shuffleQuiz', () => {
  it('leaves everything untouched when both options are off', () => {
    const result = shuffleQuiz(quiz, { questions: false, answers: false })
    expect(result).toEqual(quiz)
  })

  it('never mutates the input quiz', () => {
    const before = JSON.stringify(quiz)
    shuffleQuiz(quiz, { questions: true, answers: true })
    expect(JSON.stringify(quiz)).toBe(before)
  })

  it('permutes question order but keeps option order when only questions=true', () => {
    const result = shuffleQuiz(quiz, { questions: true, answers: false })
    // Same set of questions, just reordered.
    expect(sorted(questionIds(result))).toEqual(sorted(questionIds(quiz)))
    // Each question's options stay in their authored order.
    for (const q of result.questions) {
      const original = quiz.questions.find((o) => o.id === q.id)!
      expect(q.options.map((o) => o.id)).toEqual(
        original.options.map((o) => o.id),
      )
    }
  })

  it('permutes option order but keeps question order when only answers=true', () => {
    const result = shuffleQuiz(quiz, { questions: false, answers: true })
    expect(questionIds(result)).toEqual(questionIds(quiz))
    for (let i = 0; i < result.questions.length; i++) {
      // Same multiset of option ids, regardless of order.
      expect(sorted(optionIds(result, i))).toEqual(sorted(optionIds(quiz, i)))
    }
  })

  it('preserves ids, correctIds, and other fields under full shuffle', () => {
    const result = shuffleQuiz(quiz, { questions: true, answers: true })
    expect(result.title).toBe(quiz.title)
    for (const original of quiz.questions) {
      const q = result.questions.find((o) => o.id === original.id)!
      expect(q.correctIds).toEqual(original.correctIds)
      expect(q.type).toBe(original.type)
      expect(q.explanation).toBe(original.explanation)
      expect(sorted(q.options.map((o) => o.id))).toEqual(
        sorted(original.options.map((o) => o.id)),
      )
      // Every correct id still resolves to an existing option.
      for (const cid of q.correctIds) {
        expect(q.options.some((o) => o.id === cid)).toBe(true)
      }
    }
  })
})
