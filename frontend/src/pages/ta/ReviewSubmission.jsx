import { useParams } from 'react-router-dom'
import { useReview } from '../../features/ta/hooks/useReview'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function ReviewSubmission() {
  const { submissionId } = useParams()
  const { data, criteria, loading, releasing, error, updateCriterion, release } = useReview(submissionId)

  if (loading) return <p className="text-slate-500 text-sm">Loading submission...</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{data.assignment_title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{data.student_name}</p>
        </div>
        <Button onClick={release} loading={releasing}>Release to student</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Submission">
          <div className="h-96 bg-slate-100 rounded-md flex items-center justify-center text-sm text-slate-400">
            PDF viewer — embed submission here
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800">AI Feedback (editable)</h2>
          {criteria.map((c, i) => (
            <Card key={c.id}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-900">{c.name}</p>
                <div className="flex items-center gap-1">
                  <input type="number" min={0} max={c.max_score} value={c.score}
                    onChange={(e) => updateCriterion(i, 'score', Number(e.target.value))}
                    className="w-16 rounded border border-slate-300 px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <span className="text-sm text-slate-500">/ {c.max_score}</span>
                </div>
              </div>
              <textarea value={c.feedback} onChange={(e) => updateCriterion(i, 'feedback', e.target.value)} rows={3}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
