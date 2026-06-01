import { z } from 'zod'
import type { Quiz, QuizQuestion } from '@/types/quiz'

/**
 * Authoring schema — the shape a user writes by hand in their JSON file.
 *
 * Example:
 * {
 *   "title": "Sample Quiz",
 *   "questions": [
 *     {
 *       "question": "Which is a JS runtime?",
 *       "type": "single",
 *       "options": ["Node.js", "Django", "Laravel"],
 *       "answer": 0,
 *       "explanation": "Node.js runs JavaScript outside the browser."
 *     }
 *   ]
 * }
 *
 * `type` is optional and inferred from the number of answers when omitted.
 * `answer` is a 0-based index (or array of indices) into `options`.
 */

const answerSchema = z.union([
  z.number().int(),
  z.array(z.number().int()).min(1),
])

const rawQuestionSchema = z
  .object({
    question: z.string().trim().min(1, 'question text is required'),
    type: z.enum(['single', 'multi']).optional(),
    options: z
      .array(z.string().min(1, 'option text cannot be empty'))
      .min(2, 'at least 2 options are required'),
    answer: answerSchema,
    explanation: z.string().optional(),
  })
  .strict()

const rawQuizSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    questions: z
      .array(rawQuestionSchema)
      .min(1, 'a quiz must have at least one question'),
  })
  .strict()

export type RawQuiz = z.infer<typeof rawQuizSchema>

export type ValidationResult =
  | { ok: true; quiz: Quiz }
  | { ok: false; errors: string[] }

function toIndexArray(answer: number | number[]): number[] {
  return Array.isArray(answer) ? answer : [answer]
}

/** Turn a Zod issue into a human-readable, path-aware message. */
function formatIssue(issue: z.ZodIssue): string {
  const path = issue.path
    .map((p) => (typeof p === 'number' ? `[${p + 1}]` : p))
    .join('.')
  const where = path ? `${path}: ` : ''
  return `${where}${issue.message}`
}

/**
 * Validate an already-parsed JSON value against the quiz schema and normalize
 * it into the internal model. Returns either the normalized quiz or a list of
 * readable error messages suitable for a toast.
 */
export function validateQuiz(raw: unknown): ValidationResult {
  const parsed = rawQuizSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map(formatIssue) }
  }

  const errors: string[] = []
  const questions: QuizQuestion[] = []

  parsed.data.questions.forEach((rawQ, qi) => {
    const label = `question ${qi + 1}`
    const indices = toIndexArray(rawQ.answer)

    // Bounds check against options.
    const outOfRange = indices.filter(
      (idx) => idx < 0 || idx >= rawQ.options.length,
    )
    if (outOfRange.length > 0) {
      errors.push(
        `${label}: answer index ${outOfRange.join(', ')} is out of range (options are 0–${
          rawQ.options.length - 1
        })`,
      )
      return
    }

    const uniqueIndices = Array.from(new Set(indices))
    const inferredType: 'single' | 'multi' =
      rawQ.type ?? (uniqueIndices.length > 1 ? 'multi' : 'single')

    if (inferredType === 'single' && uniqueIndices.length !== 1) {
      errors.push(
        `${label}: a single-answer question must have exactly one correct answer`,
      )
      return
    }

    const qId = `q${qi}`
    const options = rawQ.options.map((text, oi) => ({
      id: `${qId}-o${oi}`,
      text,
    }))
    const correctIds = uniqueIndices.map((idx) => options[idx].id)

    questions.push({
      id: qId,
      type: inferredType,
      question: rawQ.question,
      options,
      correctIds,
      explanation: rawQ.explanation?.trim() || undefined,
    })
  })

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    quiz: {
      title: parsed.data.title?.trim() || undefined,
      description: parsed.data.description?.trim() || undefined,
      questions,
    },
  }
}
