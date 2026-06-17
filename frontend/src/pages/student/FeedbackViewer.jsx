import { useParams } from 'react-router-dom'
import { useFeedback } from '../../features/student/hooks/useFeedback'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

export default function FeedbackViewer() {
  const { submissionId } = useParams()
  const { feedback, loading, error } = useFeedback(submissionId)

  if (loading) return <p className="text-slate-500 text-sm">Loading feedback...</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!feedback) return <p className="text-sm text-slate-500">No feedback available.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Feedback</h1>
        <p className="text-lg font-semibold text-primary-700">{feedback.total_score} / {feedback.max_score}</p>
      </div>

      <Card title="Summary">
        <p className="text-sm text-slate-700 leading-relaxed">{feedback.summary}</p>
      </Card>

      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-800">Criteria Breakdown</h2>
        {feedback.criteria?.map((c) => (
          <Card key={c.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-900 text-sm">{c.name}</p>
              <span className="text-sm font-semibold text-slate-700">{c.score} / {c.max_score}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{c.feedback}</p>
            {c.version_diff && c.version_diff !== 'null' && (
              <div className="mt-2 p-3 rounded-md bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">vs previous submission</p>
                <Badge status={c.version_diff === 'improved' ? 'released' : c.version_diff === 'regressed' ? 'pending' : 'draft'}>
                  {c.version_diff}
                </Badge>
              </div>
            )}
          </Card>
        ))}
      </div>

      {feedback.flagged_issues?.length > 0 && (
        <Card title="Flagged Issues">
          <ul className="space-y-2">
            {feedback.flagged_issues.map((issue, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-amber-500 mt-0.5">⚠</span>{issue}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
