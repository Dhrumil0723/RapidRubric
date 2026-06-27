const { supabase } = require('../config/supabase')

const AiFeedback = {
  async create({ submissionId, criteria, flaggedIssues, summary }) {
    const { data, error } = await supabase
      .from('ai_feedback')
      .insert({ submission_id: submissionId, criteria, flagged_issues: flaggedIssues, summary, status: 'pending_ta_review' })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async findBySubmissionId(submissionId) {
    const { data, error } = await supabase
      .from('ai_feedback')
      .select('*')
      .eq('submission_id', submissionId)
      .maybeSingle()
    if (error) throw error
    return data
  },
}

module.exports = AiFeedback
