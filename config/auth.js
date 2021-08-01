exports.isUser= function(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash('danger','Please Log In');
        res.redirect('/user/login')
    }
}


exports.isAdmin= function(req,res,next){
    if(req.isAuthenticated() && req.user.admin == 1) {
        next();
    }else{
        req.flash('danger','Please Log In');
        res.redirect('/user/login')
    }
}

