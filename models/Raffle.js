const mongoose = require('mongoose');

const raffleSchema = new mongoose.Schema({
    raffle_product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    winning_ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'RaffleTicket' },
    winning_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ticket_price: Number,
    total_tickets: Number,
    date_started: {
        type: Date,
        default: Date.now()
    }
});


module.exports = new mongoose.model('Raffle', raffleSchema);