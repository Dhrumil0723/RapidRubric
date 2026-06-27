// Centralized error handler. Maps well-known error shapes to clean HTTP
// responses so clients always receive a JSON { message } body.
function errorHandler(err, req, res, _next) {
  console.error(err)

  // Multer upload errors (e.g. file too large).
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File exceeds the maximum allowed size' })
  }
  if (err?.name === 'MulterError') {
    return res.status(400).json({ message: `Upload error: ${err.message}` })
  }

  // Malformed JSON body (thrown by express.json()).
  if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ message: 'Request body is not valid JSON' })
  }

  const status = err.status ?? 500
  res.status(status).json({ message: err.message ?? 'Internal server error' })
}

module.exports = { errorHandler }
