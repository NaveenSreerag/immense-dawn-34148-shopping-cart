var express = require('express');
var router = express.Router();
var Review = require('../models/review')
var moment = require('moment');

router.post('/:productId/reviews', function(req,res){


    var rating=req.body.rating;
    var review = req.body.review;



    // req.checkBody('rating', 'Rating filed maximum 5').isLength({min:1, max:5});
    // req.checkBody('review', 'Review is Required').notEmpty();


    // var errors = req.validationErrors();

    // if(errors){
    //     res.redirect('back',{
    //         errors:errors,
    //         rating:rating,
    //         review:review
    //     })
    // }else{

        var review = new Review({
            rating: rating,
            review : review,
            user:req.user.id,
            product:req.params.productId
            
        }) ;
    
        review.save(function(err){
            if(err) {
                return console.log(err);
    
            }else{
                req.flash('success','Review Added');
                res.redirect('back')
            }



            
           
         
            
        })



})



// delete

router.get('/:reviewId/delete',function(req,res){
    
    Review.findByIdAndDelete(req.params.reviewId, function(err){
        if(err){
            console.log(err);
        }else{
            req.flash('success','Review Deleted');
            res.redirect('back')
        }
    })
})
module.exports = router;
