const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Models
const Shoe = require('../models/Shoe');



// Welcome Page
router.get('/', async (req, res) => {
    res.render('admin/home', { page: 'Admin Dashboard' });
});


// Shoe Page
router.get('/shoes', async (req, res) => {
    const shoes = await Shoe.find();
    res.render('admin/shoes/shoes', { page: 'Admin Shoes', shoes });
});

// Add Shoe
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
    res.redirect('/admin/shoes');
})

// Edit Shoe

router.get('/shoes/edit/:shoeId', async (req, res) => {
    const shoeToEdit = req.params.shoeId;
    const shoe = await Shoe.findById(shoeToEdit);
    res.render('admin/shoes/edit', {page: 'Edit Shoe', shoe})
})

router.patch('/shoes/edit/:shoeId', async (req, res) => {
    try {
        const shoeToEdit = req.params.shoeId;
        const updates = req.body;
        const options = {new: true}
        await Shoe.findByIdAndUpdate(shoeToEdit, updates, options);
        res.redirect(`/admin/shoes/edit/${shoeToEdit}`)
    } catch (error) {
        console.log(error);
    }

})





module.exports = router;