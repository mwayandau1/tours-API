const express = require('express');
const connectDB = require('./DB/connection');
require('express-async-errors')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const CustomError = require('./utils/customError')
const globalErrorHandler = require('./controllers/errorsController')
const app = express()

//ROUTES
const tourRoutes = require('./routes/tourRoutes')
const authRoutes = require('./routes/authRoute')
const userRoutes = require('./routes/userRoute')


//MEDDILEWARES
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))


app.use('/api/v1/tours', tourRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)


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