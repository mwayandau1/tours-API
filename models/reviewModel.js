const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema({
    review:{
        type:String,
        maxlength:200,
        required:[true, "Review can not be empty"]
    },
    rating:{
        type:Number,
        min:[1, "Please rating cannot be less than 1"],
        max:[5, "Please rating cannot be more than 4"],
        required:[true, "Please provide rating for this tour"]
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:"Tour"
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

reviewSchema.index({tour:1, user:1}, {unique:true})

reviewSchema.pre(/^find/, function(next){
    // this.populate({
    //     path:"tour",
    //     select:"name "
    // })
    this.populate({
        path:"user",
        select:"name photo "
    })
    next()
})

module.exports = mongoose.model("Review", reviewSchema)