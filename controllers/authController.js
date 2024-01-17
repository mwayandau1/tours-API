const User = require('../models/userModel')
const getTokenUser = require('../utils/getTokenUser')
const {attachCookiesToResponse} = require('../utils/jwt')

const registerUser = async(req, res)=>{
    const userAlreadyExist = await User.findOne({email:req.body.email})
    if(userAlreadyExist){
        throw new Error("User with this email already exist")
    }
    const isFirstUser = (await User.countDocuments({}))=== 0
    req.body.role = isFirstUser ? "admin":"user"
    const user = await User.create(req.body)

    const tokenUser = getTokenUser(user)
    attachCookiesToResponse({res,user:tokenUser})
    res.status(200).json({user:tokenUser})
}

const loginUser = async(req, res)=>{
    const {email, password} = req.body
    if(!email || !password){
        throw new Error("Please provide both values")
    }
    const user = await User.findOne({email})
    if(!user){
        throw new Error("No user found with email ")
    }
    const isPasswordCorrect = await user.comparePasswords(password)
    if(!isPasswordCorrect){
        throw new Error("Invalid credentials")
    }
    const tokenUser = getTokenUser(user)
    attachCookiesToResponse({res, user:tokenUser})
    res.status(200).json({message:"Success", user:tokenUser})
}


const logoutUser = async(req, res)=>{
    res.cookie('jwt', "token",{
        httpOnly:true,
        expires:new Date(Date.now() + 5000)
    })
    res.send("Logged out")
}

module.exports = {registerUser, loginUser, logoutUser}