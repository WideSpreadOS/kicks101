const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    name: {
        type: String,
        required: true
    },
    description: String,
    price: {
        base: {
            type: Number,
            required: true
        },
        discount: Number
    },
    sku: String,
    main_image: String,
    images: [String],
    product_type: String,
    graphics: Boolean,
    gender: [String],
    available_sizes: [Number],
    url: String,
    rating: Number,
    main_color: String,
    accent_colors: [String],
    materials: [String],
    in_stock: Number,
    reorder_alert: Number
});


module.exports = new mongoose.model('Product', productSchema);