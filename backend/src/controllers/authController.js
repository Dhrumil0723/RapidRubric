const bcrypt = require('bcryptjs')
const { supabase } = require('../config/supabase')

const ALLOWED_ROLES = ['student', 'ta', 'instructor']

async function register(req, res, next) {
  try {
    const { email, password, name, role } = req.body

    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'email, password, name, and role are required' })
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${ALLOWED_ROLES.join(', ')}` })
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, role },
    })

    if (createError) {
      return res.status(400).json({ message: createError.message })
    }

    // Trigger already inserted the profiles row with role; update it with the bcrypt hash.
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ password_hash: passwordHash })
      .eq('id', user.id)

    if (updateError) {
      await supabase.auth.admin.deleteUser(user.id)
      return res.status(500).json({ message: 'Failed to save user profile' })
    }

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, role },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { register }
