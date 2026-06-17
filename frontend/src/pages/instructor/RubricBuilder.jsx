import { useNavigate } from 'react-router-dom'
import { useRubric } from '../../features/instructor/hooks/useRubric'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function RubricBuilder() {
  const navigate = useNavigate()
  const { title, setTitle, criteria, addCriterion, removeCriterion, updateCriterion, save, loading, error, totalPoints } = useRubric()

  const handleSubmit = (e) => {
    e.preventDefault()
    save()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Rubric Builder</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rubric title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Essay Rubric — Term 1"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Criteria</h2>
            <span className="text-sm text-slate-500">Total: {totalPoints} pts</span>
          </div>

          {criteria.map((c, index) => (
            <Card key={c.id}>
              <div className="flex items-start gap-3">
                <span className="mt-2 text-xs font-bold text-slate-400 w-5 shrink-0">{index + 1}</span>
                <div className="flex-1 space-y-3">
                  <div className="flex gap-3">
                    <input required placeholder="Criterion name" value={c.name}
                      onChange={(e) => updateCriterion(c.id, 'name', e.target.value)}
                      className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <div className="flex items-center gap-1.5">
                      <input type="number" min={1} required value={c.max_score}
                        onChange={(e) => updateCriterion(c.id, 'max_score', e.target.value)}
                        className="w-20 rounded-md border border-slate-300 px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      <span className="text-sm text-slate-500">pts</span>
                    </div>
                  </div>
                  <textarea placeholder="Description for the AI and TAs..." value={c.description}
                    onChange={(e) => updateCriterion(c.id, 'description', e.target.value)} rows={2}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                </div>
                {criteria.length > 1 && (
                  <button type="button" onClick={() => removeCriterion(c.id)}
                    className="mt-2 text-slate-400 hover:text-red-500 text-lg leading-none">×</button>
                )}
              </div>
            </Card>
          ))}

          <button type="button" onClick={addCriterion}
            className="w-full rounded-md border-2 border-dashed border-slate-300 py-3 text-sm text-slate-500 hover:border-primary-400 hover:text-primary-600 transition-colors">
            + Add criterion
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" loading={loading}>Save Rubric</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/instructor')}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
