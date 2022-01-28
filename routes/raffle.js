const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Stripe = require('stripe')
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);



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

    res.redirect(`/raffle/tickets/${ticket.id}/checkout`)
})

router.get(`/tickets/:ticketId/checkout`, ensureAuthenticated, async (req, res) => {
    const ticketId = req.params.ticketId;
    const amount = 100
    const amountInCents = amount * 100
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                name: "Ticket",
                currency: 'usd',
                quantity: 1,
                amount: amountInCents
            }
        ],
        mode: 'payment',
        success_url: 'http://kicks-101.herokuapp.com/raffle/payment/success',
        cancel_url: `http://kicks-101.herokuapp.com/raffle/payment/cancel/${ticketId}`
    })
    res.redirect(303, session.url)
})

router.get('/payment/success', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id
    const user = await User.findById(userId)
    const allTickets = await RaffleTicket.find()
    const ticketsLeft = (100 - allTickets.length)
    console.log(`Tickets Left: ${ticketsLeft}`)
    const tickets = await RaffleTicket.find({ 'ticket_holder': userId })
    res.render('user/raffle-success', { user, ticketsLeft, tickets})
})

router.get('/payment/cancel/:ticketId', ensureAuthenticated, async (req, res) => {
    const ticketId = req.params.ticketId;
    const userId = req.user.id
    RaffleTicket.findByIdAndDelete(ticketId);
    res.redirect(`/raffle`)
})
module.exports = router;