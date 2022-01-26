const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


// Models
const User = require('../models/User');
const Address = require('../models/Address');
const Company = require('../models/Company');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const UnregisteredCart = require('../models/UnregisteredCart');
const { ensureAuthenticated } = require('../config/auth');


// Current Cart Page
router.get('/shopping-cart', async (req, res) => {
    const user = req.user;
    const companies = await Company.find();

    if (!req.session.cart) {
        return res.render('cart/home', {products: null})
    }
    const cart = new UnregisteredCart(req.session.cart)
    console.log(req.session)
    res.render('cart/home', { page: 'Current Cart', companies, products: cart.generateArray(), totalPrice: cart.totalPrice, totalQty: cart.totalQty  });
});

router.get(`/add/:productId/:size`, async (req, res, next) => {
    const productId = req.params.productId;
    const cart = new UnregisteredCart(req.session.cart ? req.session.cart : {})
    Product.findById(productId, function(err, product) {
        if (err) {
            return res.redirect('/products')
        }
        const availableSizes = product.available_sizes;

        const chosenSizeA = req.params.size;

        const size = availableSizes.find(element => {
            return element === chosenSizeA;
        });

        //let size = product.available_sizes == chosenSize;
        console.log(product.available_sizes)
        cart.add(product, product.id, size);
        req.session.cart = cart;
        console.log(req.session.cart)
        res.redirect('/cart/shopping-cart')
    })
})
router.get(`/reduce/:productId`, async (req, res, next) => {
    const productId = req.params.productId;
    const cart = new UnregisteredCart(req.session.cart ? req.session.cart : {})
/*     Product.findById(productId, function(err, product) {
        if (err) {
            return res.redirect('/products')
        }
        const availableSizes = product.available_sizes;

        const chosenSizeA = req.params.size;

        const size = availableSizes.find(element => {
            return element === chosenSizeA;
        });

        //let size = product.available_sizes == chosenSize;
        console.log(product.available_sizes)
        cart.remove(product, product.id, size);
        req.session.cart = cart;
        console.log(req.session.cart)
    }) */
    cart.reduceByOne(productId)
    req.session.cart = cart;
    res.redirect('/cart/shopping-cart')
})

router.get(`/remove/:productId`, async (req, res, next) => {
    const productId = req.params.productId;
    const cart = new UnregisteredCart(req.session.cart ? req.session.cart : {})
/*     Product.findById(productId, function(err, product) {
        if (err) {
            return res.redirect('/products')
        }
        const availableSizes = product.available_sizes;

        const chosenSizeA = req.params.size;

        const size = availableSizes.find(element => {
            return element === chosenSizeA;
        });

        //let size = product.available_sizes == chosenSize;
        console.log(product.available_sizes)
    })
         */
        cart.removeItem(productId);
        req.session.cart = cart;
        console.log(req.session.cart)
        res.redirect('/cart/shopping-cart')
})

router.post('/checkout-mailing', async (req, res) => {
    const mailingData = req.body
    res.redirect('/cart/checkout-billing')
})
router.get('/checkout-mailing', async (req, res) => {
    res.render('cart/checkout', {page: 'Mailing Information'})
})

router.get('/checkout-billing', async (req, res) => {
    res.render('cart/checkout-billing', {page: 'Billing Information'})
})


// Product Page
router.get('/products', async (req, res) => {
    const companies = await Company.find();
    const products = await Product.find().populate('manufacturer').exec();
    res.render('admin/product/home', { page: 'Admin Products', pageHeader: 'Home', companies, products });
});

router.post('/products/add', (req, res) => {
    const newCompanyData = req.body
    const product = new Product(newCompanyData)
    product.save()
    res.redirect('/admin/products');
});

router.get('/products/details/:productId', async (req, res) => {
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('manufacturer').exec();
    res.render('admin/product/details', { product })
});

router.get('/products/type/:productType', async (req, res) => {
    const productType = req.params.productType;
    const companies = await Company.find();
    const products = await Product.find({ product_type: productType }).populate('manufacturer').exec();
    res.render('admin/product/type', { page: productType, products, companies })
});

router.get('/products/manufacturer/:manufacturerId', async (req, res) => {
    const manufacturerId = req.params.manufacturerId;
    const companies = await Company.find();
    const company = await Company.findById(manufacturerId)
    const products = await Product.find({ manufacturer: manufacturerId }).populate('manufacturer').exec();
    res.render('admin/product/manufacturer', { page: company.name, products, companies })
});

router.get('/products/edit/:productId', async (req, res) => {
    const companies = await Company.find();
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('manufacturer').exec();
    res.render('admin/product/edit', { product, companies })
});

router.patch('/products/edit/:productId', async (req, res) => {
    try {
        const productToEdit = req.params.productId;
        const updates = req.body;
        const options = { new: true }
        await Product.findByIdAndUpdate(productToEdit, updates, options);
        res.redirect(`/admin/products/edit/${productToEdit}`)
    } catch (error) {
        console.log(error);
    }
});


router.delete('/products/delete/:productId', async (req, res) => {
    const productToDelete = req.params.productId;
    await Product.findByIdAndDelete(productToDelete);
    res.redirect(`/admin/products`)
});










module.exports = router;