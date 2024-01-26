const express = require('express')
const router = express.Router()
const {registerUser, loginUser, logoutUser,
    forgotPassword, resetPassword, updatePassword} = require('../controllers/authController')
const { authenticateUser } = require('../middlewares/authenticateUser')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/logout', logoutUser)
router.post('/forgot-password', forgotPassword)
router.patch('/reset-password/:token', resetPassword)
router.patch('/update-password',authenticateUser, updatePassword)

module.exports = router