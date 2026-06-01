import { AppShell } from '@/components/app-shell'
import { Toaster } from '@/components/ui/sonner'
import { useQuizStore } from '@/store/quiz-store'
import { UploadView } from '@/views/upload-view'
import { QuizView } from '@/views/quiz-view'
import { ResultsView } from '@/views/results-view'

export default function App() {
  const phase = useQuizStore((s) => s.phase)

  return (
    <AppShell>
      {phase === 'upload' && <UploadView />}
      {phase === 'quiz' && <QuizView />}
      {phase === 'results' && <ResultsView />}
      <Toaster />
    </AppShell>
  )
}
