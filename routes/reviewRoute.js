const express = require("express")
const { createReview, getAllReviews, getSingleReview } = require("../controllers/reviewController")
const {authenticateUser} = require("../middlewares/authenticateUser")
const router = express.Router({mergeParams:true})

// router.route("/").post(authenticateUser, createReview).get(getAllReviews)
// router.route("/:id").get(getSingleReview)

router.post("/", authenticateUser, createReview)
router.get("/", getAllReviews)
router.get("/:id", getSingleReview)
module.exports = router