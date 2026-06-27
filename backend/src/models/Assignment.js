const { supabase } = require('../config/supabase')

const Assignment = {
  async create({ courseId, rubricId, taId, title, description, dueAt, allowResubmission, maxFileBytes }) {
    const { data, error } = await supabase
      .from('assignments')
      .insert({
        course_id: courseId,
        rubric_id: rubricId,
        ta_id: taId ?? null,
        title,
        description: description ?? null,
        due_at: dueAt,
        allow_resubmission: allowResubmission ?? false,
        ...(maxFileBytes ? { max_file_bytes: maxFileBytes } : {}),
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*, rubrics(*), ta:profiles!assignments_ta_id_fkey(full_name, email)')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data
  },

  // Open assignments (deadline not passed) the given student is enrolled in.
  async findOpenForStudent(studentId) {
    // 1) courses the student is enrolled in
    const { data: enrollments, error: enrollErr } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('profile_id', studentId)
    if (enrollErr) throw enrollErr

    const courseIds = enrollments.map((e) => e.course_id)
    if (courseIds.length === 0) return []

    // 2) open assignments in those courses
    const { data, error } = await supabase
      .from('assignments')
      .select('id, title, description, due_at, allow_resubmission, course_id')
      .in('course_id', courseIds)
      .gt('due_at', new Date().toISOString())
      .order('due_at', { ascending: true })
    if (error) throw error
    return data
  },
}

module.exports = Assignment
