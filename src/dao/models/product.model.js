import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const productCollection = 'products'
const productSchema = new mongoose.Schema({

    title: String,
    description: String,
    price: Number,
    code: String,
    category: String,
    stock: Number,
    thumbnail: Array

})

productSchema.plugin(mongoosePaginate)
export const productModel = mongoose.model(productCollection, productSchema);

