const Review = require("../models/reviewModel")
const asyncHandler = require("../utils/asyncHandler")
const CustomError = require("../utils/customError")


const createReview = asyncHandler(async(req, res, next)=>{
    const reviewAlreadyExist = await Review.findOne({user:req.user.id, tour:req.body.tour})
    console.log(req.user)
    if(reviewAlreadyExist){
        return next(new CustomError("You have already place review for this tour", 400))
    }
    const review = await Review.create({
      review:req.body.review,
      rating:req.body.rating,
      user:req.user.id,
      tour:req.body.tour || req.params.id
    })
    console.log(req.params)
    res.status(201).json({status:"success", review})
    // console.log(req.user)
    // res.status(200).json("Create review")
})

const getAllReviews = asyncHandler(async(req, res, next)=>{
    let filterObj = {}
    if(req.params.id) filterObj = {tour:req.params.id}
    const reviews = await Review.find(filterObj)
    res.status(200).json({status:"success", reviews})
})

const getSingleReview = asyncHandler(async(req, res, next)=>{
    const review = await Review.findOne({_id:req.params.id})
    if(!review){
        return next(new CustomError("No review found with this id ", 400))
    }
    res.status(200).json({review})
})



module.exports = {createReview, getAllReviews, getSingleReview}