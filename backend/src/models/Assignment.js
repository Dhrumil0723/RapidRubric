const { supabase } = require('../config/supabase')

const Assignment = {
  async findById(id) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*, rubrics(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async findOpen() {
    const { data, error } = await supabase
      .from('assignments')
      .select('id, title, due_at')
      .gt('due_at', new Date().toISOString())
      .order('due_at', { ascending: true })
    if (error) throw error
    return data
  },
}

module.exports = Assignment
