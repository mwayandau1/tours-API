const User = require('../models/userModel')
const getTokenUser = require('../utils/getTokenUser')
const {attachCookiesToResponse} = require('../utils/jwt')
const asyncHandler = require('../utils/asyncHandler')
const CustomError = require('../utils/customError')
const sendEmail = require('../utils/email')
const crypto = require('crypto')

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
    const url= `${req.protocol}://${req.get("host")}/api/vi/auth/reset-password/${resetToken}`
    const message = `Forgot your password? Please click on the link to reset your password,${url}.
     If you didn't request password reset, please ignore this email`
    try{
     await sendEmail({
        email:user.email,
        subject:"Your reset password link is valid for 10 min",
        message
     })
    res.status(200).json(`Reset password link sent to your email:${user.email}`);
    }
    catch(error){
        user.passwordResetToken = undefined
        user.passwordResetTokenExpires = undefined
        await user.save({validateBeforeSave:false})
        return next(new CustomError("There was an error sending the email. Please try again later", 500))
    }
})

const resetPassword = asyncHandler(async(req, res, next)=>{
    const resetToken = req.params.token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    const user =await User.findOne({passwordResetToken:hashedToken, passwordResetTokenExpires:{$gt:Date.now()}})
    if(!user){
        return next(new CustomError("Token expired. Please try again!", 400))
    }
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    user.passwordResetToken = undefined
    user.passwordResetTokenExpires = undefined
    user.save()
    const tokenUser = getTokenUser(user)
    attachCookiesToResponse({res, user:tokenUser})
    res.status(200).json({user:tokenUser})

})


const updatePassword = asyncHandler(async(req, res, next)=>{
    console.log("got here")
    console.log(req.user)
    const user = await User.findById(req.user.id)
    console.log(req.user)
    if(!user || !user.comparePasswords(req.body.currentPassword)){
        return next(new CustomError("Invalid credentials", 401))
    }
    user.password = req.body.newPassword
    user.confirmPassword = req.body.confirmPassword
    await user.save()
    const tokenUser = getTokenUser(user)
    attachCookiesToResponse({res, user:tokenUser})
    res.status(200).json("Password updated successfully")

})
module.exports = {registerUser, loginUser, logoutUser, forgotPassword, resetPassword, updatePassword}