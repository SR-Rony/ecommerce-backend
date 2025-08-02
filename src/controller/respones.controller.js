// server success respones
const successRespons = (res,{statusCode=500,message= "success",payload = {}})=>{
    return res.status(statusCode).json({
        success : true,
        message,
        payload,
    })
}

// server error respones
const errorRespons = (res,{statusCode=500,message= "server error"})=>{
    return res.status(statusCode).json({
        success : false,
        message
    })
}

module.exports = {successRespons,errorRespons}