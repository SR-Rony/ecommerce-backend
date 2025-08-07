const express = require('express');
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require("cookie-parser")
const createError = require('http-errors')
const rateLimit = require('express-rate-limit')
const route = require("./routers/route");
const { errorRespons } = require('./controller/respones.controller');

const app = express();
// server rate limite
const rateLimiter = rateLimit({
    window : 1* 60 * 1000 ,//1 minute
    max : 2,
    message : "sorry please try again"

})

// middlewares
app.use(cors({
  origin: ["https://next-project-chi-five.vercel.app"],
  credentials: true,// allow cookies if you're using them
}))

app.use(cookieParser())
// app.use(rateLimiter)
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// api routers
app.use(route)

app.get("/",(req,res)=>{
    res.status(200).send('welcome to my server')
})

// client error
app.use((req,res,next)=>{
    next(createError(404,"404 page is not found"))
})

// server all error handle
app.use((err,req,res,next)=>{
    return errorRespons(res,{
        message : err.message,
        statusCode : err.status
    })
})

module.exports = app;