const Tour = require('../models/tourModel')
const APIFeatures = require('../utils/APIFeatures')

const aliasTopTours = (req, res, next)=>{
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'

  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}







const getAllTours = async(req, res)=>{

    try{



     const features = new APIFeatures(Tour.find(), req.query)
                                      .filter()
                                      .sort()
                                      .limitFields()
                                      .paginate()
    const tours = await features.query
    return res.status(200).json({tours})
    }
    catch(error){
        res.status(400).json(error)
    }
}

const createTour = async (req, res) => {
    try {


      const newTour = await Tour.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err
      });
    }
  };

  const getSingleTour = async(req, res)=>{
    const {id} = req.params
    try{
    const tour = await Tour.findById(id)
    if(!tour){
      res.status(404).json("No tour found with the given id")

    }
    return res.status(200).json({tour})
  }
  catch(error){
    res.status(400).json(error)
  }
  }



  const updateTour = async(req, res)=>{
    const {id} = req.params
    try{
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new:true,
      runValidators:true
    })
    return res.status(200).json(tour)
  }
  catch(error){
    res.status(400).json(error)
  }
  }


  const deleteTour = async(req, res)=>{
    const {id} = req.params
    try{
    const tour =await Tour.findById(id)
    if(!tour){
      res.status(404).json("No tour found with the given id")
    }
    await tour.deleteOne()
    return res.status(204).json("Tour deleted")
  }
  catch(error){
    console.log(error)
    res.status(400).json(error)
  }
  }


  const calculateTourStats = async(req, res)=>{
    try{
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
  }
  catch(error){
    res.status(500).json(error)
  }
  }

  const getMonthlyPlan = async(req, res)=>{
    try{

    }
    catch(error){
      res.status(500).json(error)
    }
  }



module.exports = {getAllTours, createTour, aliasTopTours,getSingleTour, updateTour, deleteTour, calculateTourStats}