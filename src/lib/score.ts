import type { AnswerMap, Quiz, QuizQuestion } from '@/types/quiz'

export interface QuestionResult {
  question: QuizQuestion
  selectedIds: string[]
  correct: boolean
}

export interface ScoreResult {
  correctCount: number
  total: number
  results: QuestionResult[]
}

/** True when two id sets contain exactly the same members (order-independent). */
function setsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((id) => set.has(id))
}

/**
 * True when the selected option ids exactly match the question's correct set —
 * the same rule used for final scoring (no partial credit). Useful for inline
 * per-question feedback so it can never diverge from the score.
 */
export function isQuestionCorrect(
  question: QuizQuestion,
  selectedIds: string[],
): boolean {
  return setsEqual(selectedIds, question.correctIds)
}

/**
 * Score a quiz against the user's answers. A question is correct only when the
 * selected option set exactly matches the correct option set — no partial
 * credit, and an unanswered question counts as incorrect.
 */
export function scoreQuiz(quiz: Quiz, answers: AnswerMap): ScoreResult {
  const results: QuestionResult[] = quiz.questions.map((question) => {
    const selectedIds = answers[question.id] ?? []
    return {
      question,
      selectedIds,
      correct: isQuestionCorrect(question, selectedIds),
    }
  })

  return {
    correctCount: results.filter((r) => r.correct).length,
    total: quiz.questions.length,
    results,
  }
}
