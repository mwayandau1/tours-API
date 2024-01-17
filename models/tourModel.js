const mongoose = require('mongoose')


const TourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please provide the name of the tour"],
        trim:true
    },
    duration:{
        type:Number,
        required:[true, "A tour must have a duration"]
    },
    maxGroupSize:{
        type:Number,
        required:[true, "A tour must have maximum group size"]
    },
    difficulty:{
        type:String,
        required:[true, "A tour must have difficulty level"]
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:1,
        max:5
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true, "Please provide the tour price"]
    },
    priceDiscount:Number,
    summary:{
        type:String,
        required:[true, 'Please provide summary']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true, "A tour must have cover image"]
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates:[Date]
})

module.exports = mongoose.model("Tour", TourSchema)