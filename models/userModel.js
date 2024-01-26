const mongoose = require('mongoose')
const validator = require("validator")
const bcrypt = require("bcrypt")
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please provide your name to continue"],
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:[true, "Please provide your email to continue"],
        validate:{
            validator:validator.isEmail,
            message:"Please provide a valid email address"
        }
    },
    photo:{
        type:String,
    },
    password:{
        type:String,
        minlength:6,
        required:[true, "Please provide confirm password"]
    },
    confirmPassword:{
        type:String,
        minlength:6,
        required:[true, "Please provide confirm password"],
        validate:{
            validator:function(el){
                return el === this.password
            },
            message:"Password and confirm password do not match"
        }
    },
    role:{
        type:String,
        enum:{
            values:['user', 'guide', 'lead-guide', 'admin'],
            message:"{VALUES} is not a role category"
        },
        default:'user'
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetTokenExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})

userSchema.pre('save', async function(next){
    if(!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    this.confirmPassword = undefined
    next();
})
userSchema.pre("save", function(next){
    if(!this.isModified("password") || this.isNew) return next()
    this.passwordChangedAt = Date.now()-1000
    next()
})

userSchema.pre(/^find/, function(next){
    //this refers to the current document
this.find({active:{$ne:false}})
next()
})

userSchema.methods.comparePasswords = async function(passwordEntered){
    const isMatched = await bcrypt.compare(passwordEntered, this.password)
    return isMatched;
}

userSchema.methods.changePasswordAfter = function(JWTTimeStamp){
    if(this.passwordChangedAt){
        const changePasswordTmeStamp = parseInt(this.passwordChangedAt.getTime()/1000, 10)
        return JWTTimeStamp < changePasswordTmeStamp
    }
    return false
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(42).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetTokenExpires = Date.now() + 1000 * 60 *10
    console.log({resetToken, hashed:this.passwordResetToken})
    return resetToken
}


module.exports = mongoose.model("User", userSchema)