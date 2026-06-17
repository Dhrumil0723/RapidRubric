const express = require('express')
const { authenticate, requireRole } = require('../middleware/authenticate')
const reviewController = require('../controllers/reviewController')

const router = express.Router()

router.get('/queue', authenticate, requireRole('ta'), reviewController.getQueue)
router.get('/:submissionId', authenticate, requireRole('ta'), reviewController.getReview)
router.post('/:submissionId/release', authenticate, requireRole('ta'), reviewController.release)

module.exports = router
