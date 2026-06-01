import { Check, PartyPopper, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { QuizQuestion } from '@/types/quiz'
import { useQuizStore } from '@/store/quiz-store'

function optionText(question: QuizQuestion, id: string): string {
  return question.options.find((o) => o.id === id)?.text ?? id
}

export function ResultsView() {
  const getScore = useQuizStore((s) => s.getScore)
  const reset = useQuizStore((s) => s.reset)

  const score = getScore()
  if (!score) return null

  const { correctCount, total, results } = score
  const incorrect = results.filter((r) => !r.correct)
  const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const perfect = incorrect.length === 0

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 animate-fade-up">
      {/* Score summary */}
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center sm:p-10">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Your score
          </p>
          <p className="font-display text-6xl font-semibold leading-none tracking-tight sm:text-7xl">
            {correctCount}
            <span className="text-muted-foreground/60"> / {total}</span>
          </p>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
              perfect
                ? 'bg-success/10 text-success'
                : 'bg-secondary text-secondary-foreground',
            )}
          >
            {percent}% correct
          </span>
        </CardContent>
      </Card>

      {/* Review or celebrate */}
      {perfect ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
              <PartyPopper className="size-7" />
            </span>
            <h2 className="font-display text-2xl font-semibold">
              Perfect score!
            </h2>
            <p className="text-pretty text-muted-foreground">
              You answered every question correctly. Nothing to review here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Review{' '}
            <span className="text-muted-foreground">
              ({incorrect.length} to revisit)
            </span>
          </h2>

          <div className="space-y-4">
            {incorrect.map(({ question, selectedIds }) => (
              <Card key={question.id}>
                <CardContent className="space-y-4 p-6">
                  <p className="text-balance-safe whitespace-pre-wrap font-medium leading-snug">
                    {question.question}
                  </p>

                  <div className="space-y-2.5 text-sm">
                    {/* Your answer */}
                    <div className="flex items-start gap-2.5">
                      <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                      <p className="text-balance-safe min-w-0">
                        <span className="font-medium text-muted-foreground">
                          Your answer:{' '}
                        </span>
                        {selectedIds.length > 0 ? (
                          <span className="text-foreground">
                            {selectedIds
                              .map((id) => optionText(question, id))
                              .join(', ')}
                          </span>
                        ) : (
                          <span className="italic text-muted-foreground">
                            not answered
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Correct answer */}
                    <div className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <p className="text-balance-safe min-w-0">
                        <span className="font-medium text-muted-foreground">
                          Correct answer:{' '}
                        </span>
                        <span className="text-foreground">
                          {question.correctIds
                            .map((id) => optionText(question, id))
                            .join(', ')}
                        </span>
                      </p>
                    </div>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-center">
        <Button size="lg" onClick={reset}>
          <RotateCcw /> Start over
        </Button>
      </div>
    </div>
  )
}
