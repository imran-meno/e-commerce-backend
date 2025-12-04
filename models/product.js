const mongoose= require('mongoose')

const product_schema=mongoose.Schema({
    product_name:String,
    product_image:String,
    product_price:Number,
    product_rating:{
        type:Number,
        default: 0,
        min:0,
        max:5

    }
})

module.exports=mongoose.model('product',product_schema)