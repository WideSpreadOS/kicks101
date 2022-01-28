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
const Raffle = require('../models/Raffle');
const RaffleTicket = require('../models/RaffleTicket');
const RaffleWinner = require('../models/RaffleWinner');
const UnregisteredCart = require('../models/UnregisteredCart');
const { ensureAuthenticated } = require('../config/auth');


// User Raffle Tickets Page
router.get('/', ensureAuthenticated, async (req, res) => {
    const user = req.user;
    const raffles = await Raffle.find({winning_user: user.id});
    const currentRaffle = raffles[raffles.length - 1]
    const currentRafflePrize = await Product.findById(currentRaffle.raffle_product).populate('manufacturer').exec()
    console.log(currentRaffle)
    const winningTickets = await RaffleWinner.find({winning_user: user.id});
    console.log(winningTickets)
    const allTickets = await RaffleTicket.find()
    const ticketsLeft = (100 - allTickets.length )
    console.log(`Tickets Left: ${ticketsLeft}`)
    const tickets = await RaffleTicket.find({'ticket_holder': user.id})
    res.render('user/raffle', { page: 'Your Raffle Tickets', user, raffles, tickets, ticketsLeft, winningTickets, currentRaffle, currentRafflePrize });
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
    const raffles = await Raffle.find();
    const currentRaffle = raffles[raffles.length - 1]
    const currentRafflePrize = await Product.findById(currentRaffle.raffle_product).populate('manufacturer').exec()
    console.log(currentRafflePrize)
    const allTickets = await RaffleTicket.find()
    const ticketsLeft = (100 - allTickets.length)
    console.log(`Tickets Left: ${ticketsLeft}`)
    const tickets = await RaffleTicket.find({ 'ticket_holder': userId })
    res.render('user/raffle-success', { user, ticketsLeft, tickets, currentRaffle, currentRafflePrize})
})

router.get('/payment/cancel/:ticketId', ensureAuthenticated, async (req, res) => {
    const ticketId = req.params.ticketId;
    const userId = req.user.id
    RaffleTicket.findByIdAndDelete(ticketId);
    res.redirect(`/raffle`)
})
module.exports = router;