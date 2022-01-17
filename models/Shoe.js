const mongoose = require('mongoose');

const shoeSchema = new mongoose.Schema({
    company: String,
    shoe_name: String,
    color1: String,
    color2: String,
    price: Number,
    description: String,
    sku: String,
    year: String,
    available_sizes: [Number],
    supplier_website: String,
    product_webpage: String,
    product_image_url: String,
    in_stock: Number,
    need: Number,
    item_main_image: String,
    item_images: [String]
});


module.exports = new mongoose.model('Shoe', shoeSchema);