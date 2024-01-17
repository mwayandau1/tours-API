const mongoose = require('mongoose')
const validator = require("validator")
const bcrypt = require("bcrypt")
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
    location:{
        type:String,
        trim:true
    },
    password:{
        type:String,
        minlength:6
    },
    role:{
        type:String,
        enum:{
            values:['user', 'guide', 'lead-guide', 'admin'],
            message:"{VALUES} is not a role category"
        },
        default:'user'
    }
})

userSchema.pre('save', async function(){
    if(!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.comparePasswords = async function(passwordEntered){
    const isMatched = await bcrypt.compare(passwordEntered, this.password)
    return isMatched;
}


module.exports = mongoose.model("User", userSchema)