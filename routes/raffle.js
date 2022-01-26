const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


// Models
const User = require('../models/User');
const Address = require('../models/Address');
const Company = require('../models/Company');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const RaffleTicket = require('../models/RaffleTicket');
const UnregisteredCart = require('../models/UnregisteredCart');
const { ensureAuthenticated } = require('../config/auth');


// User Raffle Tickets Page
router.get('/', ensureAuthenticated, async (req, res) => {
    const user = req.user;
    console.log(user)
    const allTickets = await RaffleTicket.find()
    const ticketsLeft = (100 - allTickets.length )
    console.log(`Tickets Left: ${ticketsLeft}`)
    const tickets = await RaffleTicket.find({'ticket_holder': user.id})
    res.render('user/raffle', { page: 'Your Raffle Tickets', user, tickets, ticketsLeft });
});

router.post('/tickets/purchase', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const ticket = new RaffleTicket({
        ticket_holder: userId
    });
    ticket.save()
    res.redirect('/raffle')
})

module.exports = router;