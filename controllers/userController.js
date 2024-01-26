const User = require('../models/userModel')
const asyncHandler = require('../utils/asyncHandler')
const CustomError = require('../utils/customError')

const filterObj = (obj, ...allowedFields)=>{
    const newObj = {}
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}

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

const updateUser = asyncHandler(async(req, res, next)=>{
    const {id} = req.params
    const user = await User.findByIdAndUpdate(id, req.body,{
        new:true,
        runValidators:true
    })
    if(!user){
        return next(new CustomError("User with this id does not exist", 404))
    }
    res.status(200).json({status:"success", user})
})


const deleteUser = asyncHandler(async(req, res, next)=>{
    const user = await User.findByIdAndDelete(req.params.id)
    if(!user){
        return next(new CustomError("User with this id does not exist", 404))

    }
    res.status(200).json({status:"success", message:"User has been deleted"})
})


const updateMe = asyncHandler(async(req, res, next)=>{
    if(req.body.password || req.body.confirmPassword){
        return next(new CustomError("Please only use update password route to update password"))
    }
    const filteredBody = filterObj(req.body, "name", "email")
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody,{
        new:true,
        runValidators:true
    })

    res.status(200).json({status:"success",  message:"Updated successfully", user})
})

const deleteMe = asyncHandler(async(req, res, next)=>{
    const user = await User.findByIdAndUpdate(req.user.id, {active:false})
    res.status(204).json("Success")
})
module.exports = {getAllUsers, getSingleUser, updateUser, deleteUser, updateMe, deleteMe}