import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSubmission } from '../../features/student/hooks/useSubmission'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function SubmitAssignment() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [comments, setComments] = useState('')
  const { submit, loading, error, MAX_FILE_MB } = useSubmission(assignmentId)

  const handleSubmit = (e) => {
    e.preventDefault()
    submit({ file, comments })
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Submit Assignment</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Upload PDF <span className="text-slate-400 font-normal">(max {MAX_FILE_MB} MB)</span>
            </label>
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Comments <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" loading={loading}>Submit</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/student')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
