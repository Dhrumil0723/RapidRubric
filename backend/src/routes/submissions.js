const express = require('express')
const multer = require('multer')
const { authenticate, requireRole } = require('../middleware/authenticate')
const submissionController = require('../controllers/submissionController')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

router.get('/', authenticate, requireRole('student'), submissionController.listMine)
router.post('/:assignmentId', authenticate, requireRole('student'), upload.single('file'), submissionController.create)
router.get('/feedback/:submissionId', authenticate, requireRole('student'), submissionController.getFeedback)

module.exports = router
