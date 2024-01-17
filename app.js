const express = require('express');
const connectDB = require('./DB/connection');
require('express-async-errors')
require('dotenv').config()
const cookieParser = require('cookie-parser')

const app = express()

//ROUTES
const tourRoutes = require('./routes/tourRoutes')
const authRoutes = require('./routes/authRoute')


//MEDDILEWARES
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))


app.use('/api/v1/tours', tourRoutes)
app.use('/api/v1/auth', authRoutes)

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