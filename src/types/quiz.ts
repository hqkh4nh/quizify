/**
 * Internal, normalized quiz model used throughout the app.
 *
 * Authored JSON uses a friendlier shape (plain string options + numeric answer
 * indices). It is validated and normalized into these types by `validateQuiz`,
 * so the rest of the app always works with stable option ids.
 */

export type QuestionType = 'single' | 'multi'

export interface QuizOption {
  /** Stable id, e.g. "q0-o2". */
  id: string
  text: string
}

export interface QuizQuestion {
  /** Stable id, e.g. "q0". */
  id: string
  type: QuestionType
  question: string
  options: QuizOption[]
  /** Ids of the correct option(s). Always length >= 1. */
  correctIds: string[]
  explanation?: string
}

export interface Quiz {
  title?: string
  description?: string
  questions: QuizQuestion[]
}

/** Map of question id -> selected option ids. */
export type AnswerMap = Record<string, string[]>
