const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const env = require('dotenv').config()
const Stripe = require('stripe')
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);


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
    const itemArray = cart.generateArray()
    
    for (i of itemArray) {
        console.log(i.item._id)
    }
    
    //console.log(cart.generateArray())
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

router.get('/checkout', (req, res, next) => {
    if (!req.session.cart) {
        return res.redirect('/cart/shopping-cart')
    }
    const cart = new UnregisteredCart(req.session.cart)
    const items = cart.generateArray()
    for (i of items) {
        console.log(i.item._id)
    }
    res.render('cart/checkout', {page: 'Checkout', products: cart.generateArray(), total: cart.totalPrice, cart})
});





/* 
*/



/*       
router.post('/create-checkout-session', async (req, res) => {

    try {
        console.log(itemsInCart)
        for (item of itemsInCart) {
            console.log(item)
        } */
/* 
        const itemsInCart = req.body.items;
        console.log(itemsInCart)
        
            for ( i of itemsInCart ) {
            let product = await Product.findById(i)
            }
            
            const mappedItems = new Map([
                [{name: product.name, price: product.price.base, quantity: req.session.cart.items[i].qty }],
            ])
            
    

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map(item => {
                mappedItems.get(item)
                return {

                    name: item.name,
                    amount: req.session.cart.totalPrice,
                    unit_amount: item.price,
                    currency: 'usd',
                    quantity: 1
                }
            }),
            success_url: 'http://localhost/cart/success',
            cancel_url: 'http://localhost/cart/shopping-cart'
        })
        res.json({url: session.url})
    }).catch (e) {
        res.status(500).json({error: e.message})
    }
})
    
 */







/* 
const calculateOrderAmount = (items) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    
    return 1400;
};
const storeItems = new Map(items, {
    product: item.id,
    price: item.price

}); */

/* router.post('/create-checkout-session', async (req, res) => {
    const domainURL = 'http://localhost:5000/cart/checkout';
    const { quantity, price, name, id } = req.body;
    stripe.charges.create({
        amount: price,
        currency: "usd",
        source: "tok_amex", // obtained with Stripe.js
        metadata: { 'order_id': '6735' }
    });

    // Create new Checkout Session for the order
    // Other optional params include:
    // [billing_address_collection] - to display billing address details on the page
    // [customer] - if you have an existing Stripe Customer ID
    // [customer_email] - lets you prefill the email input in the Checkout page
    // [automatic_tax] - to automatically calculate sales tax, VAT and GST in the checkout page
    // For full details see https://stripe.com/docs/api/checkout/sessions/create
    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
            {

                price_data: { unit_amoutnt: price },
                product_data: {
                    name: name,
                    id: id
                },
                quantity: quantity

            },
        ],
        // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
        success_url: `${domainURL}/cart/payment-complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${domainURL}/cart/checkout`,
        automatic_tax: {enabled: true},
    });

    return res.redirect(303, session.url);
}); */
/* router.post("/create-payment-intent", async (req, res) => {
    const { items } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "usd",
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
}); 
router.get('/payment-complete', (req, res, next) => {
    if (!req.session.cart) {
        return res.redirect('/cart/shopping-cart')
    }
    const cart = new Cart(req.session.cart);
    res.render('cart/payment-complete', {page: 'Payment Complete', total: cart.totalPrice, cart})
});
*/



router.post('/checkout-mailing', async (req, res) => {
    const mailingData = req.body
    const cart = req.session.cart
    console.log(mailingData)
    console.log(cart.totalQty)
    console.log(cart.totalPrice)

    const order = new Cart({
                    "unregistered_user.fname": req.body.fname,
                    "unregistered_user.lname": req.body.lname,
                    "unregistered_user.mailing_address.street": req.body.street,
                    "unregistered_user.mailing_address.building": req.body.building_number,
                    "unregistered_user.mailing_address.apartment": req.body.apartment_number,
                    "unregistered_user.mailing_address.city": req.body.city,
                    "unregistered_user.mailing_address.state": req.body.state,
                    "unregistered_user.mailing_address.zip": req.body.zip,
                    "unregistered_user.mailing_address.country": req.body.country,
                    "unregistered_user.mailing_address.special_instructions": req.body.special_instructions,
                    total_quantity: cart.totalQty,
                    total_price: cart.totalPrice
    })
    order.save()



    res.redirect(`/cart/checkout-add-items/${order.id}`)
// Create new Order({})

// Push all Products into order.products[]

// Redirect to billing page with order.id

    //res.redirect(`/cart/checkout-billing/${orderId}`)
})

router.get('/checkout-add-items/:cartId', async (req, res) => {
    const cartId = req.params.cartId;
    const cart = new UnregisteredCart(req.session.cart)
    const itemArray = cart.generateArray()
    console.log(itemArray)
    const addItems = async () => {

        for (i of itemArray) {
            console.log(i.item)
            let id = mongoose.Types.ObjectId(i.item._id);
            let qty = i.qty
            let size = i.size
            console.log('Item Quantity: ' + qty)
            console.log('Item Size: ' + size)
            await Cart.findByIdAndUpdate(cartId,
                { $push: { items: {
                    product: id,
                    quantity: qty,
                    chosen_size: size
                } } },
                { safe: true, upsert: true },
            )
        }
    }

    addItems()
    res.redirect(`/cart/checkout-billing/${cartId}`)
})
router.get('/checkout-mailing', async (req, res) => {
    res.render('cart/checkout-mailing', {page: 'Mailing Information'})
})

router.get('/checkout-billing/:cartId', async (req, res) => {
    const cartId = req.params.cartId;
    const cart = await Cart.findById(cartId)
    const amount = cart.total_price * 100
    const tax = amount * 0.06
    const saleTotal = amount + tax
    console.log("AMOUNT: " + amount)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                name: 'Total Sale',
                price: cart.totalPrice,
                currency: 'usd',
                quantity: 1,
                amount: saleTotal
            }
        ],
        mode: 'payment',
        success_url: `http://kicks-101.herokuapp.com/cart/payment/success/${cartId}`,
        cancel_url: 'http://kicks-101.herokuapp.com/cart/shopping-cart',
    })
    res.redirect(303, session.url)
})


router.get('/payment/success/:cartId', async (req, res) => {
    const cartId = req.params.cartId;
    const cart = await Cart.findById(cartId)
/*     if (req.session.cart) {
        delete req.session.cart
    } */
    res.render('cart/success', {cart})
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