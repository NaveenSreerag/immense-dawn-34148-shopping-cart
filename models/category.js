var mongoose = require('mongoose')

var categorySchema = mongoose.Schema({
    name :{
        type:String,
        required:true
    },
    slug:{
        type:String,
        required:true,
        unique:true
    },
    categoryImage:{
        type:String,
       
    }
},{ timestamps:true});

var Category = mongoose.model('Category',categorySchema);

module.exports = Category ;