const jwt = require('jsonwebtoken');

const createJsonWebToken = (paylod,secretKey,expiresIn) =>{

    if(typeof paylod !== "object"||!paylod){
        throw new Error('paylod must be a non-empty object')
    }
    if(typeof secretKey !== "string" || secretKey===""){
        throw new Error('secretkey must be a non-empty string')
    }
    try{
        const token = jwt.sign(paylod, secretKey,{expiresIn});
        return token
    }catch(error){
        console.error('failed to sing the jwt :',error)
        throw error
    }
}

module.exports = {createJsonWebToken}