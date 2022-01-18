const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');


// Models
const Shoe = require('../models/Shoe');




// Welcome Page
router.get('/', async (req, res) => {
    const shoes = await Shoe.find();
    res.render('products/home', { page: 'Home', shoes });
});

router.post('/shoes/add', (req, res) => {

     const shoe = new Shoe({
        company: req.body.company,
        shoe_name: req.body.shoe_name,
        description: req.body.description,
        sku: req.body.sku,
        supplier_website: req.body.supplier_website,
        product_webpage: req.body.product_webpage,
        product_image_url: req.body.product_image_url,
        color1: req.body.color1,
        color2: req.body.color2,
        price: req.body.price
    })
    shoe.save()
    res.redirect('/products');
})



// Outerwear Page
router.get('/outerwear', async (req, res) => {
    res.render('products/outerwear', { page: 'Outerwear' });
});

// T-Shirts Page
router.get('/t-shirts', async (req, res) => {
    res.render('products/t-shirts', { page: 'T-Shirts' });
});

// Accessories Page
router.get('/accessories', async (req, res) => {
    res.render('products/accessories', { page: 'Accessories' });
});





module.exports = router;