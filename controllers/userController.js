const User = require('../models/userModel')
const asyncHandler = require('../utils/asyncHandler')


const getAllUsers = asyncHandler(async(req, res, next)=>{
    const users = await User.find({}).select('-password')
    res.status(200).json({
        status:"success",
        count:users.length,
        data:users
    })
})

const getSingleUser = asyncHandler(async(req, res, next)=>{
    const {id} = req.params
    const user = await User.findOne({_id:id}).select('-password')
    res.status(200).json(user)
})

module.exports = {getAllUsers, getSingleUser}