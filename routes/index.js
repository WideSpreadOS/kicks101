const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Product = require('../models/Product');
const RaffleTicket = require('../models/RaffleTicket');
const Raffle = require('../models/Raffle');
const Company = require('../models/Company');
const MissionStatement = require('../models/MissionStatement');
const SiteData = require('../models/SiteData');

// Welcome Page
router.get('/', async (req, res) => {
    let currentUser = null
    const companies = await Company.find()
    const raffles = await Raffle.find();
    const currentRaffle = raffles[raffles.length - 1]
    if (currentRaffle) {
        if (currentRaffle.dummy_ticket == false) {
        const totalTicketsAtStart = currentRaffle.total_tickets;
        const currentRafflePrize = await Product.findById(currentRaffle.raffle_product).populate('manufacturer').exec()
        console.log(currentRafflePrize)
        const allTickets = await RaffleTicket.find()
        const ticketsLeft = (totalTicketsAtStart - allTickets.length)
        res.render('landing', { page: 'Home', companies, ticketsLeft, currentRaffle, currentRafflePrize });
        } else {

            res.render('landing-no-raffle', { page: 'Home', companies });
        }
    } else {
        res.render('landing-no-raffle', { page: 'Home', companies});
    }
});

router.get('/about', async (req, res) => {
    const missionStatement = await MissionStatement.findOne()
    res.render('about', {missionStatement})
});

router.get('/contact', async (req, res) => {
    const siteData = await SiteData.find()
    res.render('contact', {siteData})
});

router.get('/social', (req, res) => {
    res.render('social')
});

router.get('/help', (req, res) => {
    res.render('help')
});






module.exports = router;