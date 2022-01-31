const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Product = require('../models/Product');
const RaffleTicket = require('../models/RaffleTicket');
const Raffle = require('../models/Raffle');
const Company = require('../models/Company');
const Feature = require('../models/Feature');
const Bug = require('../models/Bug');

// To Do Page


router.get('/', async (req, res) => {
    const features = await Feature.find()
    const bugs = await Bug.find()
    res.render('todo', {page: 'To Do Page', features, bugs})
});

router.post('/feature/add', (req, res) => {
    const feature = new Feature({
        feature_name: req.body.feature_name,
        description: req.body.description
    })
    feature.save()

    res.redirect('/todo')
});

router.post('/bug/add', (req, res) => {
    const bug = new Bug({
        page_url: req.body.page_url,
        action_attempted: req.body.action_attempted,
        description: req.body.description
    })
    bug.save()

    res.redirect('/todo')
});

router.get('/social', (req, res) => {
    res.render('social')
});

router.get('/help', (req, res) => {
    res.render('help')
});






module.exports = router;