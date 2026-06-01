import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { FileJson, FileUp, Sparkles, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { loadQuizFile, validateQuizText } from '@/lib/load-quiz-file'
import type { ValidationResult } from '@/lib/quiz-schema'
import { useQuizStore } from '@/store/quiz-store'

const SAMPLE_JSON = `{
  "title": "My Quiz",
  "questions": [
    {
      "question": "Which is a JS runtime?",
      "type": "single",
      "options": ["Node.js", "Django"],
      "answer": 0,
      "explanation": "Node.js runs JavaScript outside the browser."
    },
    {
      "question": "Select the even numbers.",
      "type": "multi",
      "options": ["1", "2", "3", "4"],
      "answer": [1, 3]
    }
  ]
}`

export function UploadView() {
  const loadQuiz = useQuizStore((s) => s.loadQuiz)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleResult(result: ValidationResult, name?: string) {
    if (result.ok) {
      const count = result.quiz.questions.length
      toast.success(
        `Loaded ${result.quiz.title ? `“${result.quiz.title}”` : 'quiz'}`,
        { description: `${count} question${count === 1 ? '' : 's'} ready.` },
      )
      loadQuiz(result.quiz)
      return
    }
    const shown = result.errors.slice(0, 3)
    const extra = result.errors.length - shown.length
    toast.error(name ? `Couldn't load “${name}”` : "Couldn't load quiz", {
      description:
        shown.join(' · ') + (extra > 0 ? ` · +${extra} more issue(s)` : ''),
    })
  }

  async function handleFile(file: File) {
    setBusy(true)
    try {
      handleResult(await loadQuizFile(file), file.name)
    } finally {
      setBusy(false)
    }
  }

  async function loadSample() {
    setBusy(true)
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}sample-quiz.json`)
      if (!res.ok) throw new Error('fetch failed')
      handleResult(validateQuizText(await res.text()), 'sample quiz')
    } catch {
      toast.error('Could not load the sample quiz.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 animate-fade-up">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Take a quiz from a file
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Load a JSON quiz file and answer it here. Nothing is uploaded.
        </p>
      </div>

      {/* Drop zone */}
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files?.[0]
          if (file) void handleFile(file)
        }}
        className={cn(
          'group relative flex w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          dragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border hover:border-primary/60 hover:bg-accent/40',
          busy && 'pointer-events-none opacity-60',
        )}
      >
        <span
          className={cn(
            'grid size-14 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors',
            dragging && 'bg-primary/10 text-primary',
          )}
        >
          <UploadCloud className="size-7" />
        </span>
        <span className="space-y-1">
          <span className="block text-lg font-medium text-foreground">
            {dragging ? 'Drop to load' : 'Drag & drop your quiz file'}
          </span>
          <span className="block text-sm text-muted-foreground">
            or click to browse — <span className="font-medium">.json</span> only
          </span>
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
            e.target.value = '' // allow re-selecting the same file
          }}
        />
      </button>

      <div className="flex">
        <Button variant="outline" onClick={loadSample} disabled={busy}>
          <Sparkles /> Try the sample quiz
        </Button>
      </div>

      {/* Expected format guidance */}
      <section className="rounded-2xl border bg-card p-6">
        <div className="mb-3 flex items-center gap-2">
          <FileJson className="size-4 text-primary" />
          <h2 className="text-base font-semibold">Expected JSON format</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          A quiz is an object with a <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">questions</code>{' '}
          array. Each question has <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">options</code> (text)
          and an <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">answer</code> — a 0-based index, or an
          array of indices for multi-answer. <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">explanation</code>{' '}
          is optional.
        </p>
        <pre className="prose-block max-h-72 overflow-auto rounded-lg bg-muted/60 p-4 text-foreground">
          {SAMPLE_JSON}
        </pre>
      </section>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <FileUp className="size-4" />
        Invalid files show exactly what needs fixing.
      </p>
    </div>
  )
}
