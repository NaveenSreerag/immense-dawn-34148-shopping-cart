var express = require('express');
var Order = require('../models/order')
var router = express.Router();
var moment = require('moment');
var auth = require('../config/auth');

var isAdmin= auth.isAdmin;


router.get('/',isAdmin, function(req,res){
   
    Order.find({status:{$ne :'remove'}},null,{sort:{'createdAt':-1}}).populate('customerId','-password').exec(function(err,orders){
        if(err){
            console.log(err);
        }else{
            res.render('admin/orders',{
                orders:orders,
                moment:moment,
                title:'Customer Orders'
            })
        }
    })

})

router.post('/status',isAdmin,function(req,res){
    Order.updateOne({_id : req.body.orderId}, {status : req.body.status}, function(err,order){

        if(err){
            req.flash('error','Something went Wrong!')
            res.redirect('/admin/orders')
        }else{
            res.redirect('/admin/orders')
        }
        
    })


})

module.exports = router;