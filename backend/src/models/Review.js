const { supabase } = require('../config/supabase')

const Review = {
  async create({ submissionId, taId, criteria, totalScore }) {
    const { data, error } = await supabase
      .from('ta_reviews')
      .insert({ submission_id: submissionId, ta_id: taId, criteria, total_score: totalScore })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async findBySubmissionId(submissionId) {
    const { data, error } = await supabase
      .from('ta_reviews')
      .select('*')
      .eq('submission_id', submissionId)
      .single()
    if (error) throw error
    return data
  },
}

module.exports = Review
