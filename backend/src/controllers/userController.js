async function getMe(req, res) {
  // Destructure only the fields safe to expose — never send deleted_at or password_hash to the client.
  const { id, full_name, email, role, created_at, updated_at } = req.profile
  return res.json({ user: { id, full_name, email, role, created_at, updated_at } })
}

module.exports = { getMe }
