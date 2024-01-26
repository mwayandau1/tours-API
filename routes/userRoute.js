const express = require('express')
const { getAllUsers, getSingleUser, updateUser,
     deleteUser, updateMe, deleteMe } = require('../controllers/userController')
const { authenticateUser, authorizePermissions } = require('../middlewares/authenticateUser')
const router = express.Router()

router.get('/', authenticateUser,  getAllUsers)
router.route("/update-me").patch(authenticateUser, updateMe)
router.delete("/delete-me", authenticateUser, deleteMe)

router.route("/:id").get(getSingleUser)
.patch(authenticateUser,authorizePermissions("admin"),updateUser)
.delete(authenticateUser,authorizePermissions("admin"), deleteUser)

module.exports = router