const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');


// Models
const Product = require('../models/Product');
const Company = require('../models/Company');




// Welcome Page
router.get('/', async (req, res) => {
    const products = await Product.find().populate('manufacturer').exec();
    res.render('products/home', { page: 'Products', products });
});

// Company Page
router.get('/:companyId', async (req, res) => {
    const companyId = req.params.companyId;
    const company = await Company.findById(companyId)
    const products = await Product.find({'manufacturer': {$eq: companyId}});
    res.render('products/company', { page: company.name, company, products });
});

// Single Product Page
router.get('/:companyId/:productId', async (req, res) => {
    const companyId = req.params.companyId;
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('manufacturer').exec();
    res.render('products/single-product', { page: product.name, product });
});



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