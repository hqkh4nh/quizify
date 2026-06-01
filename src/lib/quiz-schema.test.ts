import { describe, it, expect } from 'vitest'
import { validateQuiz } from './quiz-schema'

const validQuiz = {
  title: 'Sample',
  questions: [
    {
      question: 'Pick one',
      type: 'single',
      options: ['A', 'B', 'C'],
      answer: 1,
      explanation: 'B is correct',
    },
    {
      question: 'Pick many',
      type: 'multi',
      options: ['W', 'X', 'Y', 'Z'],
      answer: [0, 2],
    },
  ],
}

describe('validateQuiz', () => {
  it('accepts a valid quiz and normalizes options to ids', () => {
    const result = validateQuiz(validQuiz)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.quiz.questions).toHaveLength(2)
    const [q1, q2] = result.quiz.questions
    expect(q1.id).toBe('q0')
    expect(q1.options.map((o) => o.id)).toEqual(['q0-o0', 'q0-o1', 'q0-o2'])
    expect(q1.correctIds).toEqual(['q0-o1'])
    expect(q2.type).toBe('multi')
    expect(q2.correctIds).toEqual(['q1-o0', 'q1-o2'])
  })

  it('infers type from the number of answers when omitted', () => {
    const result = validateQuiz({
      questions: [
        { question: 'one', options: ['a', 'b'], answer: 0 },
        { question: 'many', options: ['a', 'b', 'c'], answer: [0, 1] },
      ],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.quiz.questions[0].type).toBe('single')
    expect(result.quiz.questions[1].type).toBe('multi')
  })

  it('rejects a quiz with no questions', () => {
    const result = validateQuiz({ questions: [] })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.join(' ')).toMatch(/at least one question/)
  })

  it('rejects a question missing required fields', () => {
    const result = validateQuiz({
      questions: [{ options: ['a', 'b'], answer: 0 }],
    })
    expect(result.ok).toBe(false)
  })

  it('rejects fewer than two options', () => {
    const result = validateQuiz({
      questions: [{ question: 'q', options: ['only'], answer: 0 }],
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.join(' ')).toMatch(/at least 2 options/)
  })

  it('rejects an out-of-range answer index', () => {
    const result = validateQuiz({
      questions: [{ question: 'q', options: ['a', 'b'], answer: 5 }],
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.join(' ')).toMatch(/out of range/)
  })

  it('rejects a single-answer question with multiple answers', () => {
    const result = validateQuiz({
      questions: [
        { question: 'q', type: 'single', options: ['a', 'b', 'c'], answer: [0, 1] },
      ],
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.join(' ')).toMatch(/exactly one correct answer/)
  })

  it('rejects a non-object input', () => {
    expect(validateQuiz('not a quiz').ok).toBe(false)
    expect(validateQuiz(null).ok).toBe(false)
    expect(validateQuiz([]).ok).toBe(false)
  })
})
