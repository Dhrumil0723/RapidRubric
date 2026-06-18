async function getMe(req, res) {
  // profile is already attached by authenticate() middleware — no second DB round-trip needed
  return res.json({ user: req.profile })
}

module.exports = { getMe }
