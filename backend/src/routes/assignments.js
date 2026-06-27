const express = require('express')
const { authenticate, requireRole } = require('../middleware/authenticate')
const assignmentController = require('../controllers/assignmentController')

const router = express.Router()

router.get('/', authenticate, requireRole('student'), assignmentController.listOpen)
router.post('/', authenticate, requireRole('instructor'), assignmentController.create)

module.exports = router
