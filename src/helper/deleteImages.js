const fs = require("fs/promises")

const deleteImg = async(imagesPath)=>{
    try{
       await fs.access(imagesPath)
        await fs.unlink(imagesPath)
        console.log('images usccessfull delete');
    }catch(err){
        console.error('images is not delete');
    }
}

module.exports = deleteImg