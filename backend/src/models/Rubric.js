const { supabase } = require('../config/supabase')

const Rubric = {
  async create({ title, criteria, instructorId }) {
    const { data, error } = await supabase
      .from('rubrics')
      .insert({ title, criteria, instructor_id: instructorId, locked: false })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async findByInstructor(instructorId) {
    const { data, error } = await supabase
      .from('rubrics')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async findById(id) {
    const { data, error } = await supabase.from('rubrics').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('rubrics').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async lock(id) {
    const { error } = await supabase.from('rubrics').update({ locked: true }).eq('id', id)
    if (error) throw error
  },
}

module.exports = Rubric
