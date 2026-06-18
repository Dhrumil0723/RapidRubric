const express = require('express')
const authRouter = require('./auth')
const usersRouter = require('./users')
const submissionsRouter = require('./submissions')
const rubricsRouter = require('./rubrics')
const reviewsRouter = require('./reviews')
const analyticsRouter = require('./analytics')

const router = express.Router()

router.use('/auth', authRouter)
router.use('/users', usersRouter)
router.use('/submissions', submissionsRouter)
router.use('/rubrics', rubricsRouter)
router.use('/ta', reviewsRouter)
router.use('/instructor/analytics', analyticsRouter)

module.exports = router
