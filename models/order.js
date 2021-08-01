var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
       
    customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:{
        type:Object,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    landmark:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    paymentType:{
        type:String,
        default:'COD'
    },
    status:{
        type:String,
        default:'order_placed'
    }
},{timestamps:true})

var Order = mongoose.model('Order',orderSchema);

module.exports = Order;
