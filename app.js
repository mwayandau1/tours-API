const express = require('express');
const connectDB = require('./DB/connection');
require('express-async-errors')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const CustomError = require('./utils/customError')
const globalErrorHandler = require('./controllers/errorsController')


//OTHER MIDDLEWARE-- RATE LIMIT--HELMET
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
//SANITIZE MIDDLEWARE
const mongoSanitize = require('express-mongo-sanitize')
const xss = require("xss-clean")
const hpp = require("hpp")
const app = express()

//ROUTES
const tourRoutes = require('./routes/tourRoutes')
const authRoutes = require('./routes/authRoute')
const userRoutes = require('./routes/userRoute')
const reviewRoutes = require("./routes/reviewRoute")

//SECURITY MIDDLEWARE
app.use(helmet())


//RATE LIMITER
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Use an external store for consistency across multiple server instances.
  message:"Too many request from this IP address. Please try again later"
})

// Apply the rate limiting middleware to all requests.
app.use("/api", limiter)


//MEDDILEWARES
app.use(express.json({limit:'10kb'}))
//SANITIZE AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize())
//DATA SANITIZATION AGAINST XSS
app.use(xss())

//PREVENT PARAMETER POLLUTION
app.use(hpp({
  whitelist:["duration", "ratingsAverage", "ratingsQuantity", "maxGroupSize", "difficulty", "price"]
}))
app.use(cookieParser(process.env.JWT_SECRET))

app.use('/api/v1/tours', tourRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/reviews', reviewRoutes)


app.all("*", (req, res, next)=>{

  return next(new CustomError(`Can't find ${req.originalUrl} on this server`, 404))
})


app.use(globalErrorHandler)

const PORT = process.env.PORT || 5000;
const start = async()=>{
    try{
      await connectDB(process.env.MONGO_URI)
      app.listen(PORT, ()=>console.log(`Up and running on port ${PORT}`))
    }
    catch(error){
        console.log(error)
    }
}

start();

// process.on("unhandledRejection", err=>{
//   console.log(err.name, err.message)
//   console.log("UNHANDLED REJECTIONS")
//   app.close(()=> process.exit(1))

// })