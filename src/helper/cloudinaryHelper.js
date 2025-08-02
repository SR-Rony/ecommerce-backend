const cloudinary = require("../config/cloudinary")
const cloudinaryHelper = async(imageUrl)=>{
    const imagePathSegment = imageUrl.split('/')
    const imageLastPath = imagePathSegment[imagePathSegment.length -1]
    const imagePathValue = imageLastPath.replace(".jpg","")
    return imagePathValue
}

const deleteCloudinaryImage = async(folderName,cloudImageId,modelName)=>{
    try {
        const {result} = await cloudinary.uploader.destroy(`${folderName}/${cloudImageId}`)
        if(result!=="ok"){
            throw new Error(`${modelName} product image is not delete.Please try again`)
        }
    } catch (error) {
        throw error
    }
}

module.exports = {cloudinaryHelper,deleteCloudinaryImage}