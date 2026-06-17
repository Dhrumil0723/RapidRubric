const express = require('express')
const { authenticate, requireRole } = require('../middleware/authenticate')
const rubricController = require('../controllers/rubricController')

const router = express.Router()

router.get('/', authenticate, requireRole('instructor'), rubricController.list)
router.post('/', authenticate, requireRole('instructor'), rubricController.create)
router.patch('/:id', authenticate, requireRole('instructor'), rubricController.update)

module.exports = router
