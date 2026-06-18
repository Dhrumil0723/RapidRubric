const { supabase } = require('../config/supabase')

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing auth token' })
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }

  // Role comes from the DB, not the JWT — prevents client-side privilege escalation.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at, updated_at, deleted_at')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return res.status(401).json({ message: 'User profile not found' })
  }

  if (profile.deleted_at) {
    return res.status(401).json({ message: 'Account has been deactivated' })
  }

  req.user = user
  req.profile = profile
  req.role = profile.role
  next()
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }
    next()
  }
}

module.exports = { authenticate, requireRole }
