const mongoose =require('mongoose');
var passportLocalMongoose=require("passport-local-mongoose");

var userSchema = mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,

    },
    username:{
        type:String,
        required:true,
         unique:true
    },

    photo:{
        type:String,
        default : 'deafult.jpg'
    },
    password:{
        type:String,
        required:true,
        minlength:8
    },
    resetPasswordToken:String,
    resetPasswordExpires:Date,
    admin:{
        type:Number
    }

},{timestamps:true});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model('User', userSchema);

module.exports =User;