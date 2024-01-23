const express = require('express')
const { getAllUsers, getSingleUser } = require('../controllers/userController')
const { authenticateUser } = require('../middlewares/authenticateUser')
const router = express.Router()

router.get('/', authenticateUser,  getAllUsers)
router.get('/:id', getSingleUser)

module.exports = router