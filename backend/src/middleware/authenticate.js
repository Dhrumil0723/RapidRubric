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

  req.user = user
  req.role = user.user_metadata?.role
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
