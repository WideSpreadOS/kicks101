const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

// Welcome Page
router.get('/', (req, res) => {
    let currentUser = null
    res.render('landing', { page: 'Home' });
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