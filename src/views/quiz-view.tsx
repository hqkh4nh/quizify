import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  X,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { isQuestionCorrect } from '@/lib/score'
import { useQuizStore } from '@/store/quiz-store'
import { useRevealStore } from '@/store/reveal-store'

export function QuizView() {
  const quiz = useQuizStore((s) => s.quiz)
  const currentIndex = useQuizStore((s) => s.currentIndex)
  const answers = useQuizStore((s) => s.answers)
  const revealedMap = useQuizStore((s) => s.revealed)
  const selectAnswer = useQuizStore((s) => s.selectAnswer)
  const reveal = useQuizStore((s) => s.reveal)
  const next = useQuizStore((s) => s.next)
  const prev = useQuizStore((s) => s.prev)
  const finish = useQuizStore((s) => s.finish)

  const revealEnabled = useRevealStore((s) => s.revealEnabled)
  const revealStyle = useRevealStore((s) => s.revealStyle)
  const lockAfterReveal = useRevealStore((s) => s.lockAfterReveal)

  if (!quiz) return null

  const total = quiz.questions.length
  const question = quiz.questions[currentIndex]
  const selected = answers[question.id] ?? []
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1
  const progress = ((currentIndex + 1) / total) * 100

  const hasSelection = selected.length > 0
  const revealed = revealEnabled && revealedMap[question.id] === true
  const correct = revealed && isQuestionCorrect(question, selected)
  const locked = revealed && lockAfterReveal
  // Single-answer questions reveal on pick under "auto"; everything else (the
  // "check" style, and all multi-answer questions) reveals via the button.
  const autoReveal =
    revealEnabled && revealStyle === 'auto' && question.type === 'single'
  const usesCheckButton = revealEnabled && !revealed && !autoReveal

  const handleSelect = (optionId: string) => {
    if (locked) return
    selectAnswer(question.id, optionId)
    if (autoReveal) reveal(question.id)
  }

  const optionRow = (opt: { id: string }) => {
    const isSelected = selected.includes(opt.id)
    const isCorrect = question.correctIds.includes(opt.id)
    return cn(
      'flex items-start gap-3 rounded-xl border p-4 transition-colors',
      locked ? 'cursor-default' : 'cursor-pointer',
      revealed
        ? isCorrect
          ? 'border-success bg-success/5'
          : isSelected
            ? 'border-destructive bg-destructive/5'
            : 'border-border'
        : isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:bg-accent/50',
    )
  }

  // A small trailing marker shown on each option once the answer is revealed.
  const optionMarker = (opt: { id: string }) => {
    if (!revealed) return null
    const isSelected = selected.includes(opt.id)
    const isCorrect = question.correctIds.includes(opt.id)
    if (isCorrect)
      return <Check className="mt-0.5 size-5 shrink-0 text-success" />
    if (isSelected)
      return <X className="mt-0.5 size-5 shrink-0 text-destructive" />
    return null
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="font-medium text-muted-foreground">
            Question{' '}
            <span className="tabular-nums text-foreground">
              {currentIndex + 1}
            </span>{' '}
            of <span className="tabular-nums">{total}</span>
          </span>
          {quiz.title && (
            <span className="min-w-0 truncate font-medium text-muted-foreground">
              {quiz.title}
            </span>
          )}
        </div>
        <Progress value={progress} />
      </div>

      {/* Question card — key forces a fresh fade per question */}
      <Card key={question.id} className="animate-fade-up">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="space-y-2">
            <h2 className="text-balance-safe whitespace-pre-wrap text-xl font-semibold leading-snug">
              {question.question}
            </h2>
            {question.type === 'multi' && (
              <p className="text-sm font-medium text-muted-foreground">
                Select all that apply
              </p>
            )}
          </div>

          {question.type === 'single' ? (
            <RadioGroup
              value={selected[0] ?? ''}
              onValueChange={handleSelect}
              disabled={locked}
            >
              {question.options.map((opt) => (
                <Label
                  key={opt.id}
                  htmlFor={opt.id}
                  className={optionRow(opt)}
                >
                  <RadioGroupItem
                    id={opt.id}
                    value={opt.id}
                    disabled={locked}
                    className="mt-0.5"
                  />
                  <span className="text-balance-safe min-w-0 flex-1 text-base font-normal leading-relaxed">
                    {opt.text}
                  </span>
                  {optionMarker(opt)}
                </Label>
              ))}
            </RadioGroup>
          ) : (
            <div className="grid gap-3">
              {question.options.map((opt) => {
                const checked = selected.includes(opt.id)
                return (
                  <Label
                    key={opt.id}
                    htmlFor={opt.id}
                    className={optionRow(opt)}
                  >
                    <Checkbox
                      id={opt.id}
                      checked={checked}
                      disabled={locked}
                      onCheckedChange={() => handleSelect(opt.id)}
                      className="mt-0.5"
                    />
                    <span className="text-balance-safe min-w-0 flex-1 text-base font-normal leading-relaxed">
                      {opt.text}
                    </span>
                    {optionMarker(opt)}
                  </Label>
                )
              })}
            </div>
          )}

          {/* Check answer (practice mode, before reveal) */}
          {usesCheckButton && (
            <Button
              variant="outline"
              onClick={() => reveal(question.id)}
              disabled={!hasSelection}
            >
              <Eye /> Check answer
            </Button>
          )}

          {/* Inline feedback (practice mode, after reveal) */}
          {revealed && (
            <div className="space-y-4">
              <div
                className={cn(
                  'flex items-center gap-2 text-sm font-medium',
                  correct ? 'text-success' : 'text-destructive',
                )}
              >
                {correct ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <XCircle className="size-4" />
                )}
                {correct ? 'Correct' : 'Incorrect'}
              </div>

              {question.explanation && (
                <div className="rounded-lg border border-border/70 bg-muted/40 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Explanation
                  </p>
                  <p className="text-balance-safe whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={prev} disabled={isFirst}>
          <ArrowLeft /> Previous
        </Button>
        {isLast ? (
          <Button onClick={finish}>
            <CheckCircle2 /> Finish quiz
          </Button>
        ) : (
          <Button onClick={next}>
            Next <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  )
}
