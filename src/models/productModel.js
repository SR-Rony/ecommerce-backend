const mongoose= require("mongoose")
const { Schema ,model} = mongoose;

const productSchema = new Schema({
    name:{
        type:String,
        required:[true,'Product name is required'],
        trim : true,
        unique:true,
        minlangth:[3,'The length of product name can be minimum 3 characters ']
    },
    slug:{
        type:String,
        required:[true,'slug is required'],
        lowercase:true,
        unique:true
    },
    description:{
        type:String,
        required:[true,'Product discription is required'],
        trim:true
    },
    price:{
        type:Number,
        required:[true,'Product price is required'],
        trim:true,
        validate:{
            validator:(v)=> v > 0,
            message:(props)=> `${props.value} is not a valid price !`
        }
    },
    quantity:{
        type:Number,
        required:[true,'Product quantity is required'],
        trim:true,
        validate:{
            validator:(v)=> v > 0,
            message:(props)=> `${props.value} is not a valid quantity !`
        }
    },
    sold:{
        type:Number,
        required:[true,'Product sold is required'],
        trim:true,
        default:0,
        // validate:{
        //     validator:(v)=> v > 0,
        //     message:(props)=> `${props.value} is not a valid sold quantity !`
        // }
    },
    shipping:{
        type:Number,
        default:0
    },
    image:{
        type:String,
        required:[true,'Product Images is required']
    },
    categoryId:{
        required:true,
        type:Schema.Types.ObjectId,
        ref:"Category"
    }
},{timestamps:true}

)
    const Product = model('Product',productSchema)
module.exports = Product