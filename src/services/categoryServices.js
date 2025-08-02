const  slugify = require("slugify")
const Category = require("../models/categoryModel")

// create category service
const createCategoryServices = async (name)=>{
    const categoryNameSlug = slugify(name)
    const newCategory = await Category.create({
        name:name,
        slug:categoryNameSlug
    })

    return newCategory
}

// update category service
const updateCategoryServices = async (slug,name)=>{
    const categoryNameSlug = slugify(name)
    const updateCategory = await Category.findOneAndUpdate({slug:slug},{$set : {name:name},slug:categoryNameSlug},{new:true})

    return updateCategory
}

// Delete category service
const deleteCategoryServices = async (slug)=>{

    const deleteCategory = await Category.findOneAndDelete({slug:slug})

    console.log('fdgfk',slug);

    return deleteCategory
}

module.exports = {
    createCategoryServices,
    updateCategoryServices,
    deleteCategoryServices
}