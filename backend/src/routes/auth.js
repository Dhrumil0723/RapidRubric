const express = require('express')
const { authenticate } = require('../middleware/authenticate')
const authController = require('../controllers/authController')

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authenticate, authController.logout)

module.exports = router
