const express = require('express')
const { getAllTours, createTour, aliasTopTours,
    updateTour, getSingleTour,
     deleteTour, calculateTourStats, getMonthlyPlan } = require('../controllers/tourController')
const router = express.Router()
const {authenticateUser, authorizePermissions} = require('../middlewares/authenticateUser')
const { getSingleTourReviews, createReview } = require('../controllers/reviewController')
const reviewRoute = require("./reviewRoute")
router.use("/:id/reviews", reviewRoute)

router.route('/top-5-cheap').get(aliasTopTours, getAllTours)
router.route('/tours-stats').get(calculateTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)
router.route('/').get(getAllTours)
router.post("/",  createTour)
router.route("/:id").get(getSingleTour).patch(updateTour)
.delete(authenticateUser, authorizePermissions("admin"),deleteTour)
// router.post("/:id/reviews",authenticateUser, authorizePermissions("user"), createReview)



module.exports = router