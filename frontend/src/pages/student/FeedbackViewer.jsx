import { useParams } from 'react-router-dom'
import { useFeedback } from '../../features/student/hooks/useFeedback'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

// Bar + dot colour based on how strong the criterion score is.
function tone(ratio) {
  if (ratio >= 0.85) return { bar: 'bg-success-600', dot: 'bg-success-600' }
  if (ratio >= 0.6) return { bar: 'bg-primary-600', dot: 'bg-primary-600' }
  return { bar: 'bg-warning-600', dot: 'bg-warning-600' }
}

export default function FeedbackViewer() {
  const { submissionId } = useParams()
  const { feedback, loading, error } = useFeedback(submissionId)

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (error) return <Card><p className="text-sm text-danger-700">{error}</p></Card>
  if (!feedback) return <Card><p className="text-sm text-slate-500">No feedback available.</p></Card>

  const releasedDate = feedback.released_at
    ? new Date(feedback.released_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 truncate">{feedback.assignment_title ?? 'Feedback'}</h1>
          {(feedback.released_by || releasedDate) && (
            <p className="text-sm text-slate-500 mt-0.5">
              Released{feedback.released_by ? ` by ${feedback.released_by}` : ''}{releasedDate ? ` · ${releasedDate}` : ''}
            </p>
          )}
        </div>
        <Button variant="secondary">Download PDF</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Final score */}
        <Card>
          <p className="text-sm text-slate-500">Final score</p>
          <p className="text-4xl font-bold text-slate-900 mt-1">
            {feedback.total_score} <span className="text-slate-400 font-semibold">/ {feedback.max_score}</span>
          </p>
          {feedback.status === 'released' && <div className="mt-3"><Badge status="released">Released</Badge></div>}

          <div className="my-5 border-t border-slate-200" />

          <p className="text-sm font-semibold text-slate-700 mb-3">Per-criterion</p>
          <div className="space-y-4">
            {feedback.criteria?.map((c) => {
              const ratio = c.max_score ? c.score / c.max_score : 0
              return (
                <div key={c.id ?? c.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700 truncate pr-2">{c.name}</span>
                    <span className="text-sm font-semibold text-slate-800 shrink-0">{c.score} / {c.max_score}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${tone(ratio).bar}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Feedback by criterion */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Feedback by criterion</h2>
            <Badge status="info">Reviewed by TA</Badge>
          </div>

          <div className="space-y-3">
            {feedback.criteria?.map((c) => {
              const ratio = c.max_score ? c.score / c.max_score : 0
              return (
                <div key={c.id ?? c.name} className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="flex items-center gap-2 font-semibold text-slate-900">
                    <span className={`w-2 h-2 rounded-full ${tone(ratio).dot}`} />
                    {c.name}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1.5">{c.feedback}</p>
                </div>
              )
            })}
          </div>

          <p className="flex items-center gap-2 text-xs text-warning-700 bg-warning-100 rounded-md px-3 py-2 mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-warning-600" />
            Drafted by AI, reviewed and edited by your TA before release.
          </p>

          {feedback.flagged_issues?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Flagged issues</p>
              <ul className="space-y-1.5">
                {feedback.flagged_issues.map((issue, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600">
                    <span className="text-warning-600 mt-0.5">⚠</span>{issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
