const User = require('../models/userModel')
const getTokenUser = require('../utils/getTokenUser')
const {attachCookiesToResponse} = require('../utils/jwt')
const asyncHandler = require('../utils/asyncHandler')
const CustomError = require('../utils/customError')

const registerUser = asyncHandler(async(req, res, next)=>{
    const userAlreadyExist = await User.findOne({email:req.body.email})
    if(userAlreadyExist){
        return next( new CustomError("User with this email already exist"))
    }
    const isFirstUser = (await User.countDocuments({}))=== 0
    req.body.role = isFirstUser ? "admin":"user"
    const user = await User.create({
        name:req.body.name,
        email:req.body.email,
        photo:req.body.photo,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword
})

    const tokenUser = getTokenUser(user)
    attachCookiesToResponse({res,user:tokenUser})
    res.status(200).json({user:tokenUser})
})

const loginUser = asyncHandler(async(req, res, next)=>{
    const {email, password} = req.body
    if(!email || !password){
         return next(new CustomError("Please provide both values"))
    }
    const user = await User.findOne({email})
    if(!user){
         return next(new CustomError("No user found with email "))
    }
    const isPasswordCorrect = await user.comparePasswords(password)
    if(!isPasswordCorrect){
         return next(new CustomError("Invalid credentials"))
    }
    const tokenUser = getTokenUser(user)
    attachCookiesToResponse({res, user:tokenUser})
    res.status(200).json({message:"Success", user:tokenUser})
})


const logoutUser = async(req, res)=>{
    res.cookie('jwt', "token",{
        httpOnly:true,
        expires:new Date(Date.now() + 5000)
    })
    res.send("Logged out")
}




const forgotPassword = asyncHandler(async(req, res, next)=>{
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user){
        return next(new CustomError("No user found with email address", 401))
    }
    const resetToken = user.createPasswordResetToken()
    await user.save({validateBeforeSave:false})
    res.status(200).json(user);
})

const resetPassword = asyncHandler(async(req, res, next)=>{
    const user = User.findOne({passwordResetToken:req.body.passwordResetToken})
})
module.exports = {registerUser, loginUser, logoutUser, forgotPassword, resetPassword}