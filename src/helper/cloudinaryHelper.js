const cloudinary = require("../config/cloudinary")

/** Cloudinary URLs: .../upload[/v123]/folder/id.ext → public_id folder/id (no ext) */
const cloudinaryHelper = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  const marker = "/upload/";
  const i = imageUrl.indexOf(marker);
  if (i === -1) {
    const last = imageUrl.split("/").pop();
    return last ? last.replace(/\.[^/.]+$/, "") : null;
  }
  let rest = imageUrl.slice(i + marker.length).split("?")[0];
  rest = rest.replace(/^v\d+\//, "");
  return rest.replace(/\.[^/.]+$/, "");
};

const deleteCloudinaryImage = async (imageUrl, modelName = "Asset") => {
  const publicId = cloudinaryHelper(imageUrl);
  if (!publicId) return;
  try {
    const { result } = await cloudinary.uploader.destroy(publicId);
    if (result !== "ok" && result !== "not found") {
      throw new Error(`${modelName} image could not be deleted. Please try again`);
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {cloudinaryHelper,deleteCloudinaryImage}