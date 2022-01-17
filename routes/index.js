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




module.exports = router;