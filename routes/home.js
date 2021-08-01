const express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Category = require('../models/category');
var fs = require('fs-extra');
var moment = require('moment');


router.get('/' ,function(req,res){


   
    Product.find({}).sort({'updatedAt':-1}).populate('reviews').exec(function (err, products) {
        res.render('index', {
            products: products,
            title:'Home'
        })

    })
  
})



router.get('/:category', function(req,res){

    var catSlug= req.params.category;

    Category.findOne({slug:catSlug}, function(err,c){
       
        
        Product.find({category:catSlug}).sort({'updatedAt':-1}).exec(function (err,products){
            res.render('products',{
                products:products,
                title: c.name
            });
        });
    });
});


router.get('/products/:category/:product', function(req,res){

    var galleryImages = null;


    Product.findOne({slug:req.params.product}).populate('reviews').exec(function(err,product){
        if(err){
            console.log(err)
        }else{

            var galleryDir = 'public/product_images/'+product._id+'/gallery';

            fs.readdir(galleryDir, function(err,files){
                if(err){
                    console.log(err);
                }else{

                    galleryImages = files;
                    
                    res.render('singleProduct',{
                        title:product.name,
                        p:product,
                        galleryImages:galleryImages,
                        moment:moment
                       
                      
                    })
                }
            })
        }
    })
})


module.exports=router;