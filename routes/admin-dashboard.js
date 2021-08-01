const express = require('express')
var router = express.Router();
var auth = require('../config/auth');

var isAdmin= auth.isAdmin;

router.get('/', isAdmin,function(req,res){
    res.render('admin/dashboard',{
        title:'Admin Dashboard'
    })
})



module.exports=router;
