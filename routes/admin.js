const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


// Models
const User = require('../models/User');
const Address = require('../models/Address');
const Company = require('../models/Company');
const Product = require('../models/Product');
const RaffleTicket = require('../models/RaffleTicket');
const RaffleWinner = require('../models/RaffleWinner');
const Cart = require('../models/Cart');
const Raffle = require('../models/Raffle');
const MissionStatement = require('../models/MissionStatement');
const SiteData = require('../models/SiteData');
const { populate } = require('../models/User');


// Welcome Page
router.get('/', async (req, res) => {
    res.render('admin/home', { page: 'Admin Dashboard' });
});

// Manufacturer Page
router.get('/manufacturers', async (req, res) => {
    const companies = await Company.find();
    res.render('admin/manufacturer/home', { page: 'Admin Manufacturers', pageHeader: 'Home', companies });
});

router.post('/manufacturers/add', (req, res) => {
    const newCompanyData = req.body
    const company = new Company(newCompanyData)
    company.save()
    res.redirect('/admin/manufacturers');
})

router.get('/manufacturer/:companyId/edit', async (req, res) => {
    const companyId = req.params.companyId;

    const company = await Company.findById(companyId)
    res.render('admin/manufacturer/edit', { page: 'Edit Company', company})
})

router.patch('/manufacturer/:companyId/update', async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const updates = req.body;
        const options = { new: true }
        await Company.findByIdAndUpdate(companyId, updates, options);
        res.redirect(`/admin/manufacturer/${companyId}/edit`)
    } catch (error) {
        console.log(error);
    }

})

router.get('/manufacturer/:companyId/delete', async (req, res) => {
    const companyId = req.params.companyId;
    await Company.findByIdAndDelete(companyId)
    res.redirect('/admin/manufacturers')
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
    res.render('admin/product/details', { product})
});

router.get('/products/type/:productType', async (req, res) => {
    const productType = req.params.productType;
    const companies = await Company.find();
    const products = await Product.find({product_type: productType}).populate('manufacturer').exec();
    res.render('admin/product/type', { page: productType, products, companies })
});

router.get('/products/manufacturer/:manufacturerId', async (req, res) => {
    const manufacturerId = req.params.manufacturerId;
    const companies = await Company.find();
    const company = await Company.findById(manufacturerId)
    const products = await Product.find({manufacturer: manufacturerId}).populate('manufacturer').exec();
    res.render('admin/product/manufacturer', { page: company.name, products, companies })
});


router.get('/products/color/:color', async (req, res) => {
    const color = req.params.color;
    const companies = await Company.find();
    const products = await Product.find({ main_color: ("#" + color) }).populate('manufacturer').exec();
    res.render('admin/product/color', { page: 'Products By Color', color: ('#' + color),products, companies })
});


router.get('/products/edit/:productId', async (req, res) => {
    const companies = await Company.find();
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('manufacturer').exec();
    res.render('admin/product/edit', {  product, companies})
});

router.patch('/products/edit/:productId', async (req, res) => {
    try {
        const productToEdit = req.params.productId;
        const updates = req.body;
        const options = { new: true }
        await Product.findByIdAndUpdate(productToEdit, updates, options);
        res.redirect(`/admin/products`)
    } catch (error) {
        console.log(error);
    }
});


router.delete('/products/delete/:productId', async (req, res) => {
        const productToDelete = req.params.productId;
        await Product.findByIdAndDelete(productToDelete);
        res.redirect(`/admin/products`)
});





/* User Info Routes */

router.get('/users', async (req, res) => {
    const users = await User.find();
    res.render('admin/users/home', { page: "All Users", users })
});


router.get('/users/details/:userId', async (req, res) => {
    const userId = req.params.userId;
    const userAddresses = await Address.find({address_owner: userId})
    const user = await User.findById(userId);
    res.render('admin/users/single-user', { page: (user.fname + " " + user.lname), user, userAddresses })
});


/* Raffle Routes */

router.get('/raffle', async (req, res) => {
    const users = await User.find();
    const tickets = await RaffleTicket.find().populate('ticket_holder').exec()
    const raffles = await Raffle.find().populate([
        {
            path: 'winning_user',
            model: 'User'
        },
        {
            path: 'raffle_product',
            model: 'Product',
            populate: {
                path: 'manufacturer',
                model: 'Company'
        }
    }
]).exec();
    
    const currentRaffle = raffles[raffles.length - 1]
    if (currentRaffle) {
        const currentRafflePrize = await Product.findById(currentRaffle.raffle_product).populate('manufacturer').exec()
        if (currentRaffle.dummy_ticket == false) {
            const currentPrizePrice = currentRafflePrize.price.base;
            console.log(currentPrizePrice)
            const currentTicketIncome = (tickets.length * currentRaffle.ticket_price)
            console.log(currentTicketIncome)
            const currentProfit = currentTicketIncome - currentPrizePrice;
            console.log(currentProfit)
            res.render('admin/raffle', { page: "Raffle", users, tickets, currentRaffle, currentRafflePrize, currentProfit, raffles })

        } else {

            res.render('admin/raffle-no-product-selected', { page: "Raffle", users, tickets, currentRaffle, raffles })
        }


    } else {
    res.render('admin/raffle-no-raffle', { page: "Raffle" })
    }
});

router.get('/raffle/new', async (req, res) => {
    const products = await Product.find().populate('manufacturer').exec()
    res.render('admin/raffle-new', {products})

})
router.post('/raffle/new', async (req, res) => {
    await Raffle.find({ dummy_ticket: true }).remove().exec(function (err, data) {
        console.log('Removed: ' + data)
    })
    const newRaffle = new Raffle({
        raffle_product: req.body.raffle_product,
        ticket_price: req.body.ticket_price,
        total_tickets: req.body.total_tickets
    })
    newRaffle.save()
    res.redirect('/admin/raffle')
})
router.get('/raffle/drawing', async (req, res) => {
    const raffleTickets = await RaffleTicket.find()
    let raffleArray = []
    for (i of raffleTickets) {
        raffleArray.push(i.id)
    }
    const raffles = await Raffle.find();
    const currentRaffle = raffles[raffles.length - 1]
    const currentRafflePrize = await Product.findById(currentRaffle.raffle_product).populate('manufacturer').exec()
    console.log(currentRafflePrize)
    const winnerId = raffleArray[Math.floor(Math.random() * raffleArray.length)];
    console.log('Winner: ' + winnerId)
    const findWinner = await RaffleTicket.findById(winnerId).populate('ticket_holder').exec()
    console.log('Ticket Holder: ' + findWinner.ticket_holder.id)
    const winningUserId = findWinner.ticket_holder.id
    //findWinner.ticket_holder
    // Random chosen ID is pushed to RaffleWinners Model with ticketId and userId
    await Raffle.findByIdAndUpdate(currentRaffle.id, {
        winning_user: winningUserId,
        winning_ticket: winnerId,
        raffle_draw: true
    })
    
    //res.render(`admin/test`, {raffleTickets})
    res.redirect(`/admin/raffle/delete-tickets/${currentRaffle.id}`)
})

router.get('/raffle/delete-tickets/:winnerId', async (req, res) => {
    const winnerId = req.params.winnerId;
    await RaffleTicket.deleteMany()
    console.log('Deleted Tickets...')
    const blankRaffle = new Raffle({
        raffle_product: null,
        winning_ticket: null,
        ticket_price: null,
        total_tickets: null,
        dummy_ticket: true
    })
    blankRaffle.save()
    res.redirect(`/admin/raffle/winner/${winnerId}`)
})

router.get('/raffle/winner/:currentRaffleId', async (req, res) => {
    const currentRaffleId = req.params.currentRaffleId;
    const currentRaffle = await Raffle.findById(currentRaffleId)
    console.log(currentRaffle)
    const winner = await User.findById(currentRaffle.winning_user)

    const raffleWinners = await Raffle.findById(currentRaffleId).populate({
        path: 'raffle_product',
        model: 'Product',
        populate: {
            path: 'manufacturer',
            model: 'Company'
        }
    }
    ).exec();
    
    console.log(currentRaffle)
    res.render('admin/raffle-winner', { winner, currentRaffle, raffleWinners})
})






/* Orders Routes */

router.get('/invoices', async (req, res) => {
    const allOrders = await Cart.find()
    res.render('admin/invoices/home', {allOrders})
})

router.get('/invoices/new', async (req, res) => {
    const allOrders = await Cart.find()
    res.render('admin/invoices/all-orders', {allOrders})
})


router.get('/invoices/new/order/:orderId', async (req, res) => {
    const orderId = req.params.orderId;
    const order = await Cart.findById(orderId).populate({
        path: 'items.product',
        model: 'Product',
        populate: {
            path: 'manufacturer',
            model: 'Company'
        }
    }).exec()
    res.render('admin/invoices/order-id', {order})
})

router.get('/invoices/new/order/:orderId/shipped', async (req, res) => {
    const orderId = req.params.orderId;
    await Cart.findByIdAndUpdate(orderId, {
        shipped: true,
        shipped_date: Date.now()
    })
    res.redirect(`/admin/invoices/new/order/${orderId}/reciept`)
})

router.get('/invoices/new/order/:orderId/reciept', async (req, res) => {
    const orderId = req.params.orderId;
    const order = await Cart.findById(orderId).populate([
        {
            path: 'for_user',
            model: 'User'
        },
        {
            path: 'items.product',
            model: 'Product',
            populate: {
                path: 'manufacturer',
                model: 'Company'
            }
        }
    ]).exec()
    res.render('admin/invoices/reciept', {order})
})
router.get('/invoices/new/order/:orderId/label', async (req, res) => {
    const orderId = req.params.orderId;
    const order = await Cart.findById(orderId)
    res.render('admin/invoices/print-label-single', {order})
})



// Site Data

router.get('/site', async (req, res) => {
    const siteData = await SiteData.find()
    const missionStatement = await MissionStatement.find()
    res.render('admin/site/home', { siteData, missionStatement})
})

router.post('/site/mission-statement', async (req, res) => {
    const missionStatement = new MissionStatement({
        mission_statement: req.body.mission_statement
    })
    missionStatement.save()
    res.redirect('/admin/site')
})
router.post('/site/contact-site', (req, res) => {

    const contactData = new SiteData({
        contact_type: req.body.contact_type,
        contact_data: req.body.contact_data
    })
    contactData.save()
    res.redirect('/admin/site')
})

router.patch('/site/contact/:id/update', async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        const options = { new: true }
        await SiteData.findByIdAndUpdate(id, updates, options);
        res.redirect(`/admin/site`)
    } catch (error) {
        console.log(error);
    }
});

router.get('/site/contact/:id/delete', async (req, res) => {
    const id = req.params.id;
    await SiteData.findByIdAndDelete(id)
    res.redirect('/admin/site')
})
router.get('/site/contact/:id/edit', async (req, res) => {
    const id = req.params.id
    const connection = await SiteData.findById(id)
    res.render('admin/site/edit', {connection})
})
router.post('/site/contact-site', (req, res) => {

    const contactData = new SiteData({
        contact_type: req.body.contact_type,
        contact_data: req.body.contact_data
    })
    contactData.save()
    res.redirect('/admin/site')
})
router.patch('/site/mission-statement/:id', async (req, res) => {
    try {
        const id = req.params.id
        const updates = req.body;
        const options = { new: true }
        await MissionStatement.findByIdAndUpdate(id, updates, options);
        res.redirect(`/admin/site`)
    } catch (error) {
        console.log(error);
    }
})
router.patch('/site/contact-site/:id', async (req, res) => {
    try {
        const id = req.params.id
        const updates = req.body;
        const options = { new: true }
        await SiteData.findByIdAndUpdate(id, updates, options);
        res.redirect(`/admin/site`)
    } catch (error) {
        console.log(error);
    }
})
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