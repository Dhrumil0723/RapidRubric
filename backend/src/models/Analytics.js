const { supabase } = require('../config/supabase')

const Analytics = {
  async getSummary(instructorId) {
    const { data, error } = await supabase
      .from('analytics_aggregates')
      .select('total_submissions, pending_review, released, avg_score')
      .eq('instructor_id', instructorId)
      .single()
    if (error) throw error
    return data
  },

  async getWeakCriteria(instructorId, limit = 3) {
    const { data, error } = await supabase
      .from('analytics_aggregates')
      .select('criterion_id, criterion_name, mean_score, max_score, feedback_samples')
      .eq('instructor_id', instructorId)
      .order('mean_score', { ascending: true })
      .limit(limit)
    if (error) throw error
    return data
  },
}

module.exports = Analytics
