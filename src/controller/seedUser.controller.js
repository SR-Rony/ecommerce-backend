const User = require("../models/userModel")
const data = require("../data")

const seedUser = async(req,res,next)=>{
    try{

        // delete all user
       await User.deleteMany({})
        // create user
        const newUser =await User.insertMany(data.users)
        // newUser.save()
        return res.status(201).json(newUser)
    }catch(error){
        next(error)
    }
}

module.exports = seedUser