const { supabase } = require('../config/supabase')

const Submission = {
  async create({ assignmentId, studentId, storagePath, comments }) {
    const { data, error } = await supabase
      .from('submissions')
      .insert({ assignment_id: assignmentId, student_id: studentId, storage_path: storagePath, comments, status: 'ai_processing' })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('submissions')
      .select('*, assignments(title, ta_email, rubrics(*)), profiles(name, email), ai_feedback(*), ta_reviews(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async findByTAId(taId) {
    const { data, error } = await supabase
      .from('submissions')
      .select('id, status, assignments(title), profiles(name)')
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
