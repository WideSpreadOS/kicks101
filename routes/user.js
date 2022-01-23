const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const csrf = require('csurf');
const { ensureAuthenticated } = require('../config/auth');
require('../config/passport')(passport);

// Models
const User = require('../models/User');
const Address = require('../models/Address');
const PaymentMethod = require('../models/PaymentMethod');



router.get('/login', (req, res) => {
    const currentUser = null
    res.render('user/login', { page: 'Login', currentUser });
})

router.get('/register', (req, res) => {
    const currentUser = null
    res.render('user/register', { page: 'Register', currentUser });
})

router.post('/register', (req, res) => {
    const { fname, lname, email, password, password2 } = req.body;
    let errors = [];
    if (!fname || !lname || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' })
    }
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' })
    }
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' })
    }

    if (errors.length > 0) {
        res.render('user/register', {
            errors,
            fname,
            lname,
            email,
            password,
            password2
        });
    } else {
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    errors.push({ msg: 'Email is already registered' })
                    res.render('user/register', {
                        errors,
                        fname,
                        lname,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        fname,
                        lname,
                        email,
                        password
                    });
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        // Set password to hashed
                        newUser.password = hash;
                        // Save user
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can log in');
                                res.render('user/login', { page: 'Login' });
                            })
                            .catch(err => console.log(err));

                    }))
                }
            })
            .catch();
    }
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/user/dashboard',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/user/login')
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    const user = req.user;
    const userId = req.user.id;
    res.render('user/dashboard', { page: 'Dashboard', user });
});

router.get('/update-profile', ensureAuthenticated, (req, res) => {
    const user = req.user;
    res.render('user/update-profile', { page: 'Update Your Profile', user })
});

router.patch('/update-profile', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const data = req.body;
    await User.findByIdAndUpdate(userId, data);
    res.redirect(req.get('referer'));
});

router.get('/mailing', ensureAuthenticated, async (req, res) => {
    const user = req.user;
    const addresses = await Address.find({address_owner: user.id})
    res.render('user/mailing', { page: 'Update Your Mailing Addresses', user, addresses })
});

router.post('/mailing', ensureAuthenticated, (req, res) => {
    const newMailingAddress = req.body
    const address = new Address(newMailingAddress)
    address.save()
    res.redirect('/user/mailing')
});

router.patch('/mailing', ensureAuthenticated, (req, res) => {
    const user = req.user;
    res.redirect('/user/mailing')
});

router.delete('/mailing', ensureAuthenticated, (req, res) => {
    const user = req.user;
    res.redirect('/user/mailing')
});

router.get('/payment', ensureAuthenticated, (req, res) => {
    const user = req.user;
    res.render('user/payment', { page: 'Update Your Payment Methods', user })
});






router.delete('/delete', ensureAuthenticated, async (req, res) => {
    const user = req.user.id;
    await User.findByIdAndDelete(user);
    res.redirect('/user/login')
});




router.get('/test', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.render('user/test-page', { page: 'Test Page', user})
});




module.exports = router;