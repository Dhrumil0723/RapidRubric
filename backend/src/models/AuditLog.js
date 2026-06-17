const { supabase } = require('../config/supabase')

const AuditLog = {
  async insert({ actorId, action, targetId, metadata = {} }) {
    const { error } = await supabase
      .from('audit_log')
      .insert({ actor_id: actorId, action, target_id: targetId, metadata })
    if (error) throw error
  },
}

module.exports = AuditLog
