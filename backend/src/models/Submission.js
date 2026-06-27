const { supabase } = require('../config/supabase')

// Two foreign keys point from submissions -> profiles (student_id, ta_id), so
// embedded reads must name the constraint to disambiguate the relationship.
const STUDENT = 'student:profiles!submissions_student_id_fkey'
const TA = 'ta:profiles!submissions_ta_id_fkey'

const Submission = {
  async create({ assignmentId, studentId, taId, storagePath, comments, versionNo = 1, previousSubmissionId = null }) {
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: studentId,
        ta_id: taId ?? null,
        storage_path: storagePath,
        comments: comments ?? null,
        status: 'ai_processing',
        version_no: versionNo,
        previous_submission_id: previousSubmissionId,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('submissions')
      .select(
        `*,
         assignments(title, due_at, allow_resubmission, rubrics(*)),
         ${STUDENT}(full_name, email),
         ${TA}(full_name, email),
         ai_feedback(*),
         ta_reviews(*)`
      )
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data
  },

  // A student's own submissions for an assignment, newest first (version chain).
  async findByStudentAndAssignment(studentId, assignmentId) {
    const { data, error } = await supabase
      .from('submissions')
      .select('id, version_no, status, created_at')
      .eq('student_id', studentId)
      .eq('assignment_id', assignmentId)
      .order('version_no', { ascending: false })
    if (error) throw error
    return data
  },

  // All of a student's submissions across assignments (student dashboard).
  async findByStudent(studentId) {
    const { data, error } = await supabase
      .from('submissions')
      .select('id, status, version_no, created_at, assignments(title, due_at)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async findByTAId(taId) {
    const { data, error } = await supabase
      .from('submissions')
      .select(`id, status, version_no, created_at, assignments(title), ${STUDENT}(full_name)`)
      .eq('ta_id', taId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async updateStatus(id, status) {
    const { error } = await supabase.from('submissions').update({ status }).eq('id', id)
    if (error) throw error
  },
}

module.exports = Submission
