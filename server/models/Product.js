/**
 * Created by Sundar on 12/8/16.
 */
var mongoose = require('mongoose');
Schema = mongoose.Schema;

var uniqueValidator = require('mongoose-unique-validator');

var ProductSchema = new mongoose.Schema({
    name:{type:String,required:true},
    category: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    productImg: {fileName: {type: String},filePath: {type: String},fileType: {type: String}}
});

var Product = mongoose.model('Product', ProductSchema);
module.exports = Product;

ProductSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' });