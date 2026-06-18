import { useRef, useState } from 'react'
import { useAssignments } from '../../features/student/hooks/useAssignments'
import { useSubmission } from '../../features/student/hooks/useSubmission'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const STATUS_LABELS = {
  pending_ta_review: 'In TA review',
  released: 'Released',
  draft: 'Draft',
}

function SubmitPanel({ assignment, onClose }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [comments, setComments] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const { submit, loading, error, MAX_FILE_MB } = useSubmission(assignment.id)

  const handleSubmit = (e) => {
    e.preventDefault()
    submit({ file, comments })
  }

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900 truncate pr-2">
          Submit: <span className="text-slate-700">{assignment.title}</span>
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 grid place-items-center w-7 h-7 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files?.[0] ?? null) }}
          className={`rounded-xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-primary-500 bg-primary-100' : 'border-primary-300 bg-primary-50/60'
          }`}
        >
          <span className="grid place-items-center w-12 h-12 mx-auto mb-3 rounded-full bg-primary-600 text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          </span>
          <p className="text-sm font-semibold text-slate-800">Drag &amp; drop your PDF</p>
          <p className="text-xs text-slate-500 mt-0.5">or click to browse · PDF only · max {MAX_FILE_MB} MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Selected file */}
        {file && (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-bold text-danger-700 bg-danger-100 rounded px-1.5 py-0.5">PDF</span>
              <span className="text-sm text-slate-700 truncate">{file.name}</span>
              <span className="text-xs text-slate-400 shrink-0">· {(file.size / 1024 / 1024).toFixed(1)} MB</span>
            </div>
            <button type="button" onClick={() => setFile(null)}
              className="text-sm font-medium text-danger-700 hover:underline shrink-0 ml-2">Remove</button>
          </div>
        )}

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Comments <span className="text-slate-400 font-normal">(optional)</span></label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            placeholder="Anything the TA should know..."
            className="w-full rounded-input border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <p className="flex items-center gap-2 text-xs text-warning-700 bg-warning-100 rounded-md px-3 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-warning-600" />
          Limits enforced on the server too.
        </p>

        {error && <p className="text-sm text-danger-700 bg-danger-100 rounded-md px-3 py-2">{error}</p>}

        <Button type="submit" loading={loading} className="w-full">Submit assignment</Button>
      </form>
    </Card>
  )
}

export default function StudentDashboard() {
  const { assignments, loading, error } = useAssignments()
  const [selected, setSelected] = useState(null)

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (error) return <Card><p className="text-sm text-danger-700">{error}</p></Card>

  const submitted = assignments.filter((a) => a.submission_status).length
  const released = assignments.filter((a) => a.submission_status === 'released').length

  const stats = [
    { label: 'Open assignments', value: assignments.length },
    { label: 'Submitted', value: submitted },
    { label: 'Feedback released', value: released },
  ]

  return (
    <div className="space-y-6">
      {/* Slim stat strip */}
      <div className="flex divide-x divide-slate-200 rounded-card border border-slate-200 bg-white shadow-card overflow-hidden">
        {stats.map((s) => (
          <div key={s.label} className="flex-1 px-5 py-3">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Assignments + submit panel */}
      <div className={selected ? 'grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6' : ''}>
        <Card title="My assignments">
          {assignments.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No open assignments right now.</p>
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => {
                const isActive = selected?.id === a.id
                return (
                  <div
                    key={a.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors ${
                      isActive ? 'border-primary-300 bg-primary-50' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{a.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Due {new Date(a.due_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        <span className="text-slate-300"> · </span>PDF · max 10 MB
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge status={a.submission_status ?? 'neutral'}>
                        {a.submission_status ? STATUS_LABELS[a.submission_status] ?? a.submission_status : 'Not submitted'}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => setSelected(a)}
                        className="text-sm font-medium text-primary-600 hover:underline"
                      >
                        {a.submission_status ? 'Resubmit' : 'Submit'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {selected && (
          <SubmitPanel key={selected.id} assignment={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  )
}
