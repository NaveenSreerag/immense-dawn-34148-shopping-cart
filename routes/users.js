var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var passport = require('passport');
var mkdirp = require('mkdirp');
var fs = require('fs-extra');

var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');


var auth = require('../config/auth');
var isUser = auth.isUser;


const dotenv = require('dotenv');
dotenv.config();


var User = require('../models/user');



router.get('/register', function (req, res) {
    res.render('register', {
        title: 'Register'

    })
})

router.post('/regsiter', function (req, res) {





    var name = req.body.name;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var confpassword = req.body.confpassword;


    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is Required').isEmail();
    req.checkBody('password', 'Password is Required').notEmpty();
    req.checkBody('confpassword', 'Password do not Match').equals(password);


    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {

            errors: errors,
            user: null,
            title: 'Register'

        })
    } else {
        User.findOne({ username: username }, function (err, user) {
            if (err) console.log(err);

            if (user) {
                req.flash('danger', 'Username Exists,Choose another!');
                res.redirect('/register')
            } else {

                var user = new User({
                    name: name,
                    username: username,
                    email: email,
                    password: password,

                    admin: 0
                });

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err) console.log(err);

                        user.password = hash;

                        user.save(function (err) {

                            if (err) return console.log(err);


                            // async..await is not allowed in global scope, must use a wrapper
                            async function main() {
                                // Generate test SMTP service account from ethereal.email
                                // Only needed if you don't have a real mail account for testing
                                let testAccount = await nodemailer.createTestAccount();

                                // create reusable transporter object using the default SMTP transport
                                let transporter = nodemailer.createTransport({
                                    service: 'Gmail',
                                    auth: {
                                        user: process.env.GMAIL,
                                        pass: process.env.GMAILPW
                                    }
                                });

                                // send mail with defined transport object
                                let info = await transporter.sendMail({
                                    from: '"Shopping Cart 👻" <cartshoppingcart@gmail.com>', // sender address
                                    to: user.email,
                                  
                                    subject: "Hello ✔", // Subject line
                                    text: "Thank you for Signing up!" // plain text body
                                    // html: "<b>Hello world?</b>", // html body
                                });

                                console.log("Message sent: %s", info.messageId);
                                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                                // Preview only available when sending through an Ethereal account
                                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                            }

                            main().catch(console.error);

                            req.flash('success', 'Successfully Signed Up! Nice to meet you ' + req.body.username);
                            res.redirect('/user/login')





                        })
                    })
                })
            }
        })

    }
})

// get login page
router.get('/login', function (req, res) {

    if (res.locals.user) res.redirect('/')
    res.render('login', {
        title: 'Login'
    })
})


// post login page

router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true,
        successFlash: 'Welcome to Shopping'
    })(req, res, next);

});


// logout page

router.get('/logout', isUser, function (req, res) {
    req.logout();

    req.flash('success', 'You are successfully Logged Out!')
    res.redirect('/')
})

// get forgot password page

router.get('/forgot-password', function (req, res) {
    res.render('forgot', {
        title: 'Forgot Password'
    })
})

router.post('/forgot-password', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });

        },

        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    req.flash('danger', 'No account with that email address exists.');
                    return res.redirect('/user/forgot-password');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },

        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.GMAIL,
                    pass: process.env.GMAILPW
                }
            });

            var mailOptions = {
                to: user.email,
                from: process.env.GMAIL,
                subject: 'Shopping cart Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
                    'if you did not request this, please ignore this email and your password will remain unchanged.\n'
            };

            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructiions.');
                done(err, 'done');
            });
        }



    ], function (err) {
        if (err) return next(err);

        res.redirect('/user/forgot-password');
    });
});


router.get('/reset/:token', function (req, res) {

    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            req.flash('danger', 'Password reset token is ivalid or has expired.');
            return res.redirect('/user/forgot-password');
        }
        res.render('reset', {
            title: 'Reset',
            token: req.params.token
        })

    });
});


router.post('/reset/:token', function (req, res) {

    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    req.flash('danger', 'Password reset token is Invalid or has expired.');
                    return res.redirect('back')
                }

                if (req.body.password === req.body.confpassword) {
                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            req.logIn(user, function (err) {
                                done(err, user)
                            });
                        });
                    });
                } else {
                    req.flash('danger', 'Passwords Do Not match.');
                    return res.redirect('back');
                }
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.GMAIL,
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: process.env.GMAIL,
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + 'has just changed. \n'
            };

            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {

        res.redirect('/');
    });
});



// user account page
router.get('/my-account', isUser, function (req, res) {
    res.render('user-account', {
        title: 'My Account'
    })
})

// user account page update
router.post('/my-account', isUser, function (req, res) {


    var profilePicFile;

    if (req.files) {
        profilePicFile = req.files.profilePic.name;
    } else {
        profilePicFile = "";
    }


    User.findByIdAndUpdate(req.user.id, { new: true }, function (err, u) {
        if (err) {
            console.log(err);
        } else {
            u.name = req.body.name;
            u.email = req.body.email;
            u.photo = profilePicFile;

            u.save(function (err) {
                if (err)
                    console.log(err);

                mkdirp('public/images/user/' + u._id, function (err) {
                    return console.log(err);
                });

                if (profilePicFile != "") {
                    var profilePic = req.files.profilePic;
                    var path = 'public/images/user/' + u._id + '/' + profilePicFile;

                    profilePic.mv(path, function (err) {
                        return console.log(err);
                    })
                }


                req.flash('success', 'Successfully Updated')
                res.redirect('/user/my-account');
            })



        }
    })



})


// post update password
// router.post('/update-password',isUser, function(req,res){

//     var errors;

//     if (req.session.errors)
//     errors = req.session.errors;
//     req.session.errors=null;

//     var currentPassword = req.body.currentPassword
//     var newPassword =req.body.newPassword
//     var confirmnewPassword =req.body.confirmnewPassword



//     req.checkBody('currentPassword','Current Password is Required!').notEmpty();
//     req.checkBody('newPassword', 'New Password is Required').notEmpty();
//     req.checkBody('confirmnewPassword','Password Do not Match!').equals(newPassword)


//     var errors = req.validationErrors();


//     if(errors){
//         req.session.errors = errors;
//         res.redirect('/user/my-account')
//     }else{
//         User.findById(req.user.id).select('+password').exec(function(err,user){
//             if(err) console.log(err);

//             if(user.password == currentPassword){
//                 user.password=newPassword;


//                 bcrypt.genSalt(10, function (err, salt) {
//                     bcrypt.hash(user.password, salt, function (err, hash) {
//                         if (err) console.log(err);

//                         user.password = hash;

//                         user.save(function(err){
//                             if(err) console.log(err);
            
//                             req.flash('success','Password Changed');
//                             res.redirect('back')
            
//                         })
//                     })
//                 })
              
                
//             }
            
//             else{
//                 req.flash('danger','Your Current Password is Wrong');
//                 res.redirect('/user/my-account')
              

                
//             }



            

            


//         })
//     }
// })

module.exports = router;