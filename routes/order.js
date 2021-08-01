var express = require('express');
var Order = require('../models/order')
var router = express.Router();
var moment = require('moment');

var auth = require('../config/auth');
var isUser = auth.isUser;


router.post('/', isUser, function (req, res) {

    const { name, phone, landmark, address } = req.body



    if (!name || !phone || !landmark || !address) {
        req.flash('error', 'All fields are Required!');
        res.redirect('/cart/checkout')
    }


    const order = new Order({
        customerId: req.user._id,
        items: req.session.cart,
        name,
        phone,
        landmark,
        address
    });
    order.save(function (err) {
        if (err) {
            req.flash('error', 'Something Went Wrong');
            res.redirect('/cart/checkout')

        } else {
            req.flash('success', 'Order Placed Successfully');
            delete req.session.cart
            res.redirect('/order/myorders')

        }
    })


});


router.get('/myorders', isUser, function (req, res) {

    Order.find({ customerId: req.user._id }, null, { sort: { 'createdAt': -1 } }, function (err, orders) {
        if (err) {
            console.log(err);
        } else {
            res.header('Cache-control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
            res.render('myorders', {
                orders: orders,
                moment: moment,
                title:'My Orders'
            })
        }
    })

})

router.get('/myorders/:id',isUser,function(req,res){
    Order.findById(req.params.id, function(err,order){

      
         //Authorize user 
         if(req.user._id.toString()=== order.customerId.toString()){
             return res.render('singleOrder.ejs',{
                    order:order,
                    title:'Order',
                    moment:moment
                })
        }


        return res.redirect('/')
         
           
        

       
    })
});

module.exports = router;



