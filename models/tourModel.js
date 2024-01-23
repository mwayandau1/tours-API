const mongoose = require('mongoose')
const slugify = require('slugify')

const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please provide the name of the tour"],
        unique:true,
        trim:true,
        minlength:[10, "A tour must have not less than 10 characters"],
        maxlength:[80, "A tour must have not more than 80 characters"]
    },
    slug:{
        type:String
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
        required:[true, "A tour must have difficulty level"],
        enum:{
            values:['easy', 'medium', 'difficult'],
            message:"Difficulty is either be easy, medium or difficult"
        }
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
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(val){
                //THIS only points to the new document creation
                return val < this.price
            },
            message:"Discount ({VALUE}) must be less than price"
        }
    },
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
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})


//DOCUMENT MIDDLEWARE
tourSchema.pre("save", function(next){
    this.slug = slugify(this.name, {lower:true})
    next()
})

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next){
    this.find({secretTour:{$ne:true}})
    // this.start = new Date.now()
    next()
})
// tourSchema.post("save", function(doc, next){
//     console.log(`Execution time is ${Date.now()- this.start}`)
//     next()
// })



//aggregation middleware
tourSchema.pre("aggregate", function(next){
    this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
    console.log(this)
    next()
})
tourSchema.virtual("durationWeeks").get(function(){
    return this.duration/7
})
module.exports = mongoose.model("Tour", tourSchema)