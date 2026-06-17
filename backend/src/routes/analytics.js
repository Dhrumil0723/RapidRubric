const express = require('express')
const { authenticate, requireRole } = require('../middleware/authenticate')
const analyticsController = require('../controllers/analyticsController')

const router = express.Router()

router.get('/summary', authenticate, requireRole('instructor'), analyticsController.getSummary)
router.get('/', authenticate, requireRole('instructor'), analyticsController.getAnalytics)

module.exports = router
