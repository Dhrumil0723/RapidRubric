import { useCourses } from '../../features/instructor/hooks/useCourses'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

export default function Courses() {
  const { courses, loading, error } = useCourses()

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (error) return <Card><p className="text-sm text-danger-700">{error}</p></Card>

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button>Create course</Button>
      </div>

      <Card title="Your courses">
        {courses.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">You don't own any courses yet.</p>
        ) : (
          <div className="space-y-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{c.name}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {c.students} students · {c.tas} TAs
                    <span className="text-slate-300"> · </span>
                    Enrollment code: <span className="font-medium text-slate-600">{c.enrollment_code}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge status="active">Active</Badge>
                  <Button variant="secondary" size="sm">Manage</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
