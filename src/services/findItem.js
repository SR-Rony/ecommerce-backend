const mongoose = require("mongoose")
const createError = require("http-errors")

const findWithIdService = async (Model,id,option={})=>{
    try{
        const item = await Model.findById(id,option)
        
        if(!item){
            throw createError(404,`${Model.modelName} dos not exist with by id`)
        }
        return item
    }catch(error){
        if(error instanceof mongoose.Error){
            throw createError(404,`Invalid ${Model.modelName} id`)
        }
        return error
    }
}

module.exports = {findWithIdService}