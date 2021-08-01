var mongoose = require('mongoose');

var reviewSchema = mongoose.Schema({

    review:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    product:{
        type: mongoose.Schema.ObjectId,
        ref:'Product',
        required:true
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    }

},{timestamps:true})

reviewSchema.pre(/^find/, function(next){
    this.populate({
        path:'product',
        select:'name'
    }).populate({
        path:'user',
        select:'name photo'
    })
    next()
});


var Review = mongoose.model('Review',reviewSchema);

module.exports =Review;