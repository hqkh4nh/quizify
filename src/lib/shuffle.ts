import type { Quiz } from '@/types/quiz'

/** Options controlling which parts of a quiz get randomized. */
export interface ShuffleOptions {
  /** Randomize the order of questions. */
  questions: boolean
  /** Randomize the order of options within each question. */
  answers: boolean
}

/**
 * Return a new array with the same elements in random order (Fisher–Yates).
 * The input array is never mutated.
 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Produce a new quiz with question order and/or option order randomized,
 * according to `opts`. Shuffling is purely presentational: option ids and
 * `correctIds` are preserved, so scoring and review stay correct regardless
 * of order. The input quiz is never mutated.
 */
export function shuffleQuiz(quiz: Quiz, opts: ShuffleOptions): Quiz {
  let questions = quiz.questions

  if (opts.answers) {
    questions = questions.map((q) => ({ ...q, options: shuffle(q.options) }))
  }

  if (opts.questions) {
    questions = shuffle(questions)
  }

  // Return a new object only when something actually changed, but never mutate.
  return questions === quiz.questions ? quiz : { ...quiz, questions }
}
