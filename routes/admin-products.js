var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var Product = require('../models/product')
var Category = require('../models/category')
var auth = require('../config/auth');

var isAdmin= auth.isAdmin;



router.get('/',isAdmin, function (req, res) {

    var count;

    Product.count(function (err, c) {
        count = c;
    });

    Product.find({}).sort({'updatedAt':-1}).exec(function (err, products) {
        res.render('admin/products', {
            products: products,
            count: count,
            title: 'Admin Products'
        })

    })
});


// get add products

router.get('/add-product',isAdmin, function (req, res) {

    Category.find(function (err, categories) {
        res.render('admin/add-product', {
            categories: categories,
            title: 'Admin/Add-product'
        });

    })

})


// post add products

router.post('/add-product',isAdmin, function (req, res) {

    var prodImagefile;

    if (req.files) {
        prodImagefile = req.files.productImage.name;
    } else {
        prodImagefile = "";
    }



    req.checkBody('name', 'Name must have a value').notEmpty();
    req.checkBody('description', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('productImage', ' You must upload a image').isImage(prodImagefile)

    var name = req.body.name;
    var slug = name.replace(/\s+/g, '-').toLowerCase();
    var description = req.body.description;
    var price = req.body.price;
    var size = req.body.size;
    var category = req.body.category;

    var errors = req.validationErrors();

    if (errors) {

        Category.find(function (err, categories) {
            res.render('admin/add-product', {
                errors: errors,
                name: name,
                description: description,
                price: price,
                categories: categories,
                title: 'Admin/Add-product'

            })

        });


    } else {

        Product.findOne({ slug: slug }, function (err, product) {

            if (product) {
                req.flash('danger', 'Product Exists Choose Another');

                Category.find(function (err, categories) {
                    res.render('admin/add-product', {

                        name: name,
                        description: description,
                        price: price,
                        categories: categories,
                        title: 'Admin/Add-product'

                    })

                });

            } else {
                var product = new Product({
                    name: name,
                    slug:slug,
                    description: description,
                    size: size,
                    price: price,
                    category: category,
                    image: prodImagefile
                   
                });

                product.save(function (err) {
                    if (err)
                        return console.log(err);

                    mkdirp('public/product_images/'+ product._id, function (err){
                        return console.log (err);
                    });

                    mkdirp('public/product_images/'+ product._id +'/gallery', function (err){
                        return console.log (err);
                    });

                    mkdirp('public/product_images/'+ product._id +'/gallery/thumbs', function (err){
                        return console.log (err);
                    });

                    if (prodImagefile != ""){
                        var productImage = req.files.productImage;
                        var path = 'public/product_images/'+product._id+'/'+prodImagefile;

                        productImage.mv(path, function(err){
                            return console.log(err)
                        });

                    }

                    req.flash('success','Product Added Successfully');
                    res.redirect('/admin/products');
                   

                });
            }
        })

    }


});

// get product edit

router.get('/edit-product/:id',isAdmin, function(req,res){

    var errors;

    if (req.session.errors)
    errors = req.session.errors;
    req.session.errors=null;

    
    var id= req.params.id;

    Category.find(function(err,categories){

        Product.findById(id, function(err,product){
            if (err){
                console.log(err);
                res.redirect('/admin/products')
            }else{

                var galleryDir ='public/product_images/'+product._id+'/gallery';
                var galleryImages= null;

                fs.readdir(galleryDir, function (err,files){
                    if(err){
                        console.log(err)
                    }else{
                        galleryImages=files;

                        res.render('admin/edit-product',{
                            errors:errors,

                            name:product.name,

                            description:product.description,

                            size:product.size,

                            price:product.price,

                            category:product.category.replace(/\s+/g,'-').toLowerCase(),

                            image:product.image,
                            
                            categories:categories,

                            galleryImages:galleryImages,
                            
                            id:product._id,

                            title: 'Admin/Edit-product'
                        })
                    }
                })
                
            }
        })

    })

   
});


//  post edit Product

router.post('/edit-product/:id',isAdmin, function(req,res){

    
    var prodImagefile;

    if (req.files) {
        prodImagefile = req.files.productImage.name;
    } else {
        prodImagefile = "";
    }



    req.checkBody('name', 'Name must have a value').notEmpty();
    req.checkBody('description', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('productImage', ' You must upload a image').isImage(prodImagefile)

    var name = req.body.name;
    var slug = name.replace(/\s+/g, '-').toLowerCase();
    var description = req.body.description;
    var price = req.body.price;
    var size = req.body.size;
    var category = req.body.category;
    var primage= req.body.primage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors){
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product'+id);
    }else{
        Product.findOne({slug:slug, _id: {'$ne': id}}, function(err,p){
            if(err)
            console.log(err);

            if(p){
                req.flash('danger','Product Exists , Choose another');
                res.redirect('/admin/products/edit-product/'+id);
            }else{
                Product.findById(id, function(err,p){
                    if(err)
                    console.log(err);

                    p.name = name;
                    p.slug=slug;
                    p.description =description;
                    p.price=price;
                    p.size=size;
                    p.category=category;

                    if (prodImagefile != ""){
                        p.image= prodImagefile;
                    }

                    p.save(function(err){
                        
                        if(err)
                        console.log(err);

                        if(prodImagefile !=""){
                            if(primage !=""){
                                fs.remove('public/product_images/'+id+'/'+primage, function(err){
                                    if (err)
                                    console.log(err);

                                });
                            }

                            var productImage= req.files.productImage;
                            var path = 'public/product_images/'+id+'/'+prodImagefile;


                            productImage.mv(path, function (err){
                                return console.log(err);
                            });
                        }

                        req.flash('success','Product Updated Successfully');
                        res.redirect('/admin/products');


                    })

                })
            }

        })
    }
   

});

//  post gallery image 

router.post('/product-gallery/:id',isAdmin, function(req,res){

    var productImage= req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/'+id+'/gallery/'+ req.files.file.name;
    var thumbpath = 'public/product_images/'+id+'/gallery/thumbs/'+req.files.file.name;


    productImage.mv(path, function(err){
        if(err) 
        console.log(err);

        resizeImg(fs.readFileSync(path), {width:120, height:120 }). then(function(buf){
            fs.writeFileSync(thumbpath,buf);
        })

    });

    res.sendStatus(200);


});


// delete gallery image

router.get('/delete-image/:image',isAdmin, function(req,res){

    var path = 'public/product_images/'+req.query.id+'/gallery/'+ req.params.image;
    var thumbpath = 'public/product_images/'+req.query.id+'/gallery/thumbs/'+req.params.image;

    fs.remove(path, function(err){
        if(err){
            console.log(err)
        }else{
            fs.remove(thumbpath, function(err){
                if (err){
                    console.log(err)
                }else{
                    req.flash('success','Image Deleted successfully');
                    res.redirect('/admin/products/edit-product/'+req.query.id)
                }
            })
        }
    })

})


// delete product

router.get('/delete-product/:id',isAdmin, function (req,res){

    var id = req.params.id;
    var path ='public/product_images/'+id;


    fs.rmdir(path,{recursive:true}, function(err){
        if(err){
            console.log(err);
        }else{
            Product.findByIdAndRemove(id, function(err){      
                    return console.log(err);
                   
            });
            
                    req.flash('success','Product Deleted Successfully');
                    res.redirect('/admin/products');
               

            
        }
    })

    
})



module.exports = router;