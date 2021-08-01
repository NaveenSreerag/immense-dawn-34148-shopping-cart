var mongoose = require('mongoose');

var productSchema = mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        required:true

    },
    description:{
        type:String,
        required:true
    },
    size:{
        type:String
    },
    image:{
        type:String
    },
    category:{
        type:String,
        required:true
    },
    // category:{
    //     type:mongoose.Schema.ObjectId,
    //     ref:'Category',
    //     required:true
    // },
    price:{
        type:Number,
        required:true
    }
    // review:[
    //     {
    //         type:mongoose.Schema.OnjectId,
    //         ref:'Review'
    //     }
    // ]

},
{timestamps:true});

// virtual populate
productSchema.virtual('reviews',{
    ref:'Review',
    localField:'_id',
    foreignField:'product'
});

productSchema.set('toObject',{virtual:true});
productSchema.set('toJSON',{virtual:true});

var Product = mongoose.model('Product',productSchema);

module.exports= Product;

