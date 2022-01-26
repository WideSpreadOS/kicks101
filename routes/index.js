const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const RaffleTicket = require('../models/RaffleTicket');

// Welcome Page
router.get('/', async (req, res) => {
    let currentUser = null
    const allTickets = await RaffleTicket.find()
    const ticketsLeft = (100 - allTickets.length)
    res.render('landing', { page: 'Home', ticketsLeft });
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