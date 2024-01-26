const Tour = require('../models/tourModel')
const APIFeatures = require('../utils/APIFeatures')
const asyncHandler = require('../utils/asyncHandler')
const CustomError = require('../utils/customError')
const aliasTopTours = (req, res, next)=>{
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'

  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}







const getAllTours = asyncHandler(async(req, res, next)=>{




     const features = new APIFeatures(Tour.find(), req.query)
                                      .filter()
                                      .sort()
                                      .limitFields()
                                      .paginate()
    const tours = await features.query
    return res.status(200).json({"count":tours.length, tours})

})

const createTour = asyncHandler(async (req, res) => {

      const existingTour = await Tour.findOne({name:req.body.name})
      if(existingTour){
        return res.status(400).json({status:"fail", message:"Tour with this name already exist.Please choose another name"})
      }
      const newTour = await Tour.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });

  });

  const getSingleTour = asyncHandler(async(req, res, next)=>{
    const {id} = req.params
    const tour = await Tour.findById(id).populate("reviews")
    if(!tour){
      return next(new CustomError(`No tour found with this ID:${id}`, 404))

    }
    return res.status(200).json({tour})

  })



  const updateTour = asyncHandler(async(req, res, next)=>{
    const {id} = req.params
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new:true,
      runValidators:true
    })
    if(!tour){
      return next(new CustomError(`No tour found with this ID:${id}`, 404))

    }
    return res.status(200).json(tour)

  })


  const deleteTour = asyncHandler(async(req, res, next)=>{
    const {id} = req.params
    const tour =await Tour.findById(id)
    if(!tour){
      return next(new CustomError(`No tour found with this ID:${id}`, 404))

    }
    await tour.deleteOne()
    return res.status(204).json("Tour deleted")

  })


  const calculateTourStats = asyncHandler(async(req, res, next)=>{
    const stats = await Tour.aggregate([
      {
        $match:{
          ratingsAverage:{ $gte:3}
        }
      },
      {
        $group:{
          _id:"$difficulty",
          numTours:{$sum:1},
          numRatings:{$sum:"$ratingsQuantity"},
          avgRating:{$avg:"$ratingsAverage"},
          avgPrice:{$avg:"$price"},
          minPrice:{$min:"$price"},
          maxPrice:{$max:"$price"}
        }
      },
      {
        $sort:{avgPrice:1}

      }
    ])
    res.status(200).json(stats)

  })

  const getMonthlyPlan = asyncHandler(async(req, res, next)=>{
      const year = req.params.year * 1;
      const plan =await Tour.aggregate([
        {
          $unwind:"$startDates"
        },
        {
          $match:{
            startDates:{
              $gte:new Date(`${year}-01-01`),
              $lte:new Date(`${year}-12-31`)
            }
          }
        },
        {
          $group:{
            _id:{$month:"$startDates"},
            numToursStats:{$sum:1},
            tours:{$push:"$name"}
          }
        },
        {
          $addFields:{month:"$_id"}
        },
        {
          $project:{
            _id:0
          }
        },
        {
          $sort:{numToursStats:-1}
        }
      ])
      res.status(200).json(plan)

  })



module.exports = {getAllTours, createTour,
   aliasTopTours,getSingleTour, updateTour,
   deleteTour, calculateTourStats,getMonthlyPlan
  }