var express = require('express');
var router = express.Router();

var Product = require('../models/product')


router.get('/add/:product', function(req,res){

    var slug = req.params.product;

    Product.findOne({slug:slug}).sort({'updatedAt':-1}).exec(function(err,p){

        if(err) console.log(err);

        if(typeof req.session.cart == "undefined"){
            req.session.cart = [];
            req.session.cart.push({
                name:slug,
                qty:1,
                price:p.price,
                category:p.category,
                image:'/product_images/'+p._id+'/'+p.image
            });

        }else{
            var cart = req.session.cart;
            var newItem= true;

            for (var i =0; i < cart.length; i++){

                if(cart[i].name == slug){
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }


            if (newItem){
                cart.push({
                    name:slug,
                    qty:1,
                    price:p.price,
                    category:p.category,
                    image:'/product_images/'+p._id+'/'+p.image
                });
            }
        }

   
        req.flash('success', 'Added to cart');
        res.redirect('back');


    })
});


// get checkout page

router.get('/checkout', function(req,res){

    if(req.session.cart && req.session.cart.length == 0){
        delete req.session.cart;
        res.redirect('/cart/checkout')
    }else{

        res.render('checkout',{
            title:'Checkout',
            cart:req.session.cart
        });
    }

})



// update cart 

router.get('/update/:product', function(req,res){

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i =0; i < cart.length; i++){
        if(cart[i].name == slug){
            switch (action){
                case "add" :
                    cart[i].qty++;
                    break;

                    case "remove" :
                    cart[i].qty--;
                    if(cart[i].qty < 1 ) cart.splice(i, 1);
                    break;
                    
                    case "clear" :
                    cart.splice(i,1);
                    if (cart.length == 0) delete req.session.cart;
                    break;

                    default:
                        console.log('Update Problem');
                        break;
                    
            }

            break;
        }
    }



    req.flash('success', 'Cart Updated!');
    res.redirect('/cart/checkout')
});




router.get('/clear', function(req,res){
    delete req.session.cart;

    req.flash('success','Cart Cleared!');
    res.redirect('/');

});
module.exports = router;
