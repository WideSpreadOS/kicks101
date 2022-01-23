const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    for_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: Number,
            size: Number
        }
    ],
    ship_to: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' },
    order_date: {
        type: Date,
        default: Date.now()
    },
    shipped_date: {
        type: Date,
        default: Date.now()
    }
});


module.exports = new mongoose.model('Cart', cartSchema);