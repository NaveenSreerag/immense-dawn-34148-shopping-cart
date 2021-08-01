var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var Category = require('../models/category')
var auth = require('../config/auth');

var isAdmin= auth.isAdmin;


router.get('/',isAdmin, function (req, res) {

    Category.find({}).sort({ 'updatedAt': -1 }).exec(function (err, categories) {

        if (err) return console.log(err);

        res.render('admin/categories', {
            categories: categories,
            title: 'Admin Categories'
        });

    });


});

//get add category

router.get('/add-category', isAdmin,function (req, res) {
    res.render('admin/add_category', {
        title: 'Add Category'
    })
});




// post category

router.post('/add-category',isAdmin, function (req, res) {

    var catImagefile;

    if (req.files){
         catImagefile = req.files.categoryImage.name;
    }else{
        catImagefile="";
    }

    

    req.checkBody('name', 'Name Must have a value.').notEmpty();
    req.checkBody('categoryImage', 'You must upload an Image').isImage(catImagefile);

    var name = req.body.name;
    var slug = name.replace(/\s+/g, '-').toLowerCase();
    

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_category', {
            errors: errors,
            title:'error/Add Category',
            name: name,
            slug:slug
          
      
        })
    } else {
        Category.findOne({ slug: slug }, function (err, category) {
            if (category) {
                req.flash('danger', 'Category Name exists, Choose Another');
                res.render('admin/add_category', {
                    name: name,
                    title:'Add Category'
                });
            } else {
                var category = new Category({
                    name: name,
                    slug: slug,
                    categoryImage: catImagefile
                });

                category.save(function (err) {
                    if (err) return console.log(err);



                    mkdirp('public/category_images/' + category._id, function (err) {
                        return console.log(err);
                    });

                    if (catImagefile != "") {
                        var categoryImage = req.files.categoryImage;
                        var path = 'public/category_images/' + category._id + '/' + catImagefile;

                        categoryImage.mv(path, function (err) {
                            return console.log(err);

                        });

                    }

                    Category.find({}).sort({ 'updatedAt': -1 }).exec(function (err, categories) {

                        if(err){
                          console.log(err)
                        }else{
                          req.app.locals.categories = categories;
                        }
                      
                      });

                    req.flash('success', 'Category Added');
                    res.redirect('/admin/categories')


                })
            }
        })
    }


});


// get edit category
router.get('/edit-category/:id',isAdmin, function(req,res){
    var errors;
    if (req.session.errors) errors =req.session.errors;
    req.session.errors= null;

    Category.findById(req.params.id, function (err,cat){
        if (err){
            console.log(err);
            res.redirect('/admin/categories')
        }else{

            res.render('admin/edit-category',{
                title:'Edit Category',
                name:cat.name,
                image:cat.categoryImage,
                id:cat._id
            });

        }


    })
    
});

// post edit category

router.post('/edit-category/:id',isAdmin,function(req,res){
    var catImagefile;
    if (req.files){
        catImagefile= req.files.categoryImage.name;
    }else{
        catImagefile="";
    }


    req.checkBody('name','Name must have a value').notEmpty();
    req.checkBody('categoryImage','You must upload a image').isImage(catImagefile);


    var name =req.body.name;
    var slug = name.replace(/\s+/g,'-').toLowerCase();
    var catimage = req.body.catimage;
    var id =req.params.id;


    var errors =req.validationErrors();

    if (errors){
        req.session.errors =errors;
        res.redirect('/admin/categories/edit-category/'+ id);
    }else{
        Category.findOne({slug:slug, _id:{ '$ne': id }}, function(err,cat){
            if (err) return console.log(err);

            if(cat){
                req.flash('danger',' Name exists , Choose Another');
                res.redirect('/admin/categories/edit-category/'+id);
            }else{
                Category.findById(id, function(err,cat){
                    if(err) return console.log(err);

                    cat.name = name;
                    cat.slug = slug;
                    
                    if (catImagefile !=""){
                        cat.categoryImage= catImagefile;
                    }

                    cat.save(function(err){
                        if (err) return console.log(err);

                        if(catImagefile !=""){
                            if(catimage !=""){
                                fs.remove('public/category_images/'+id+'/'+catimage, function (err){
                                    if (err)
                                        console.log(err);
                                    
                                });

                            }

                            var categoryImage = req.files.categoryImage;
                            var path = 'public/category_images/'+id+'/'+catImagefile;

                            categoryImage.mv(path, function(err){
                                return console.log(err);

                            });


                        }


                        Category.find({}).sort({ 'updatedAt': -1 }).exec(function (err, categories) {

                            if(err){
                              console.log(err)
                            }else{
                              req.app.locals.categories = categories;
                            }
                          
                          });
                        
                        req.flash('success','Category Edited')
                        res.redirect('/admin/categories');

                    });
                });
            }
        })
    }
});


// delete category

router.get('/delete-category/:id',isAdmin,function(req,res){

    var id = req.params.id;
    var path = 'public/category_images/'+id;

    fs.remove(path,function(err){
        if(err){
            console.log(err)
        }else{

            Category.findByIdAndRemove(id, function(err){
                if(err){
                    console.log(err);
                    req.flash('danger','Something Went wrong');
                    res.redirect('/admin/categories');
                }else{

                    Category.find({}).sort({ 'updatedAt': -1 }).exec(function (err, categories) {

                        if(err){
                          console.log(err)
                        }else{
                          req.app.locals.categories = categories;
                        }
                      
                      });

                      
                    req.flash('success', 'Category Deleted')
                    res.redirect('/admin/categories')
                }
            })
        }
    })
 
});



module.exports = router;
