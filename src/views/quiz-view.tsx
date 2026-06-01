import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useQuizStore } from '@/store/quiz-store'

export function QuizView() {
  const quiz = useQuizStore((s) => s.quiz)
  const currentIndex = useQuizStore((s) => s.currentIndex)
  const answers = useQuizStore((s) => s.answers)
  const selectAnswer = useQuizStore((s) => s.selectAnswer)
  const next = useQuizStore((s) => s.next)
  const prev = useQuizStore((s) => s.prev)
  const finish = useQuizStore((s) => s.finish)

  if (!quiz) return null

  const total = quiz.questions.length
  const question = quiz.questions[currentIndex]
  const selected = answers[question.id] ?? []
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1
  const progress = ((currentIndex + 1) / total) * 100

  const optionRow = (selectedState: boolean) =>
    cn(
      'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
      selectedState
        ? 'border-primary bg-primary/5'
        : 'border-border hover:bg-accent/50',
    )

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
              onValueChange={(id) => selectAnswer(question.id, id)}
            >
              {question.options.map((opt) => (
                <Label
                  key={opt.id}
                  htmlFor={opt.id}
                  className={optionRow(selected.includes(opt.id))}
                >
                  <RadioGroupItem
                    id={opt.id}
                    value={opt.id}
                    className="mt-0.5"
                  />
                  <span className="text-balance-safe min-w-0 text-base font-normal leading-relaxed">
                    {opt.text}
                  </span>
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
                    className={optionRow(checked)}
                  >
                    <Checkbox
                      id={opt.id}
                      checked={checked}
                      onCheckedChange={() => selectAnswer(question.id, opt.id)}
                      className="mt-0.5"
                    />
                    <span className="text-balance-safe min-w-0 text-base font-normal leading-relaxed">
                      {opt.text}
                    </span>
                  </Label>
                )
              })}
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
