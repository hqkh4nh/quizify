import { validateQuiz, type ValidationResult } from '@/lib/quiz-schema'

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB — generous for a text quiz file.

function isJsonFile(file: File): boolean {
  return (
    file.type === 'application/json' ||
    file.type === 'text/json' ||
    file.name.toLowerCase().endsWith('.json')
  )
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Could not read the file.'))
    reader.readAsText(file) // FileReader decodes as UTF-8 by default.
  })
}

/**
 * Read a local File, parse it, and validate it against the quiz schema —
 * entirely client-side. Always resolves to a ValidationResult so callers can
 * surface a toast without dealing with thrown errors.
 */
export async function loadQuizFile(file: File): Promise<ValidationResult> {
  if (!isJsonFile(file)) {
    return { ok: false, errors: ['Only .json files are supported.'] }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, errors: ['File is too large (max 5 MB).'] }
  }

  let text: string
  try {
    text = await readAsText(file)
  } catch {
    return { ok: false, errors: ['Could not read the file.'] }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, errors: ['That file is not valid JSON.'] }
  }

  return validateQuiz(parsed)
}

/** Validate parsed JSON text fetched from a URL (used for the bundled sample). */
export function validateQuizText(text: string): ValidationResult {
  try {
    return validateQuiz(JSON.parse(text))
  } catch {
    return { ok: false, errors: ['That file is not valid JSON.'] }
  }
}
