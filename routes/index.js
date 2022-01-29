const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Product = require('../models/Product');
const RaffleTicket = require('../models/RaffleTicket');
const Raffle = require('../models/Raffle');
const Company = require('../models/Company');

// Welcome Page
router.get('/', async (req, res) => {
    let currentUser = null
    const companies = await Company.find()
    const raffles = await Raffle.find();
    const currentRaffle = raffles[raffles.length - 1]
    const currentRafflePrize = await Product.findById(currentRaffle.raffle_product).populate('manufacturer').exec()
    console.log(currentRafflePrize)
    const allTickets = await RaffleTicket.find()
    const ticketsLeft = (100 - allTickets.length)
    res.render('landing', { page: 'Home', companies, ticketsLeft, currentRaffle, currentRafflePrize });
});

router.get('/about', (req, res) => {
    res.render('about')
});

router.get('/contact', (req, res) => {
    res.render('contact')
});

router.get('/social', (req, res) => {
    res.render('social')
});

router.get('/help', (req, res) => {
    res.render('help')
});






module.exports = router;