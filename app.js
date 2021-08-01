var express = require('express');
var path = require('path');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
var expressMessage = require('express-messages');
var fileUpload = require('express-fileupload');
var passport = require('passport');
var bcrypt = require('bcryptjs');
var cookieParser = require('cookie-parser')



//connect to db
mongoose.connect('mongodb+srv://navi:navi@nav.tqjfp.mongodb.net/cart?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(function(){
  console.log("Database Connected")
})
  


//init app
const app = express();



//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

//set public folder
app.use(express.static('public'));

//  set global errors variable
app.locals.errors = null;


// body parser
app.use(express.urlencoded({ extended: false }));


app.use(cookieParser());
//express session
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,

  // cookie: { secure: true }
}));

// express validators
app.use(expressValidator({

  customValidators: {
    isImage: function (value, filename) {
      var extension = (path.extname(filename)).toLowerCase();
      switch (extension) {
        case '.jpg':
          return '.jpg';
        case '.jpeg':
          return '.jpeg';

        case '.png':
          return '.png';

        case '':
          return '.jpg';

        default:
          return false;


      }
    }
  }
}));


// categories model
var Category = require('./models/category');

Category.find({}).sort({ 'updatedAt': -1 }).exec(function (err, categories) {

  if(err){
    console.log(err)
  }else{
    app.locals.categories = categories;
  }

});


// express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// passport config
require('./config/passport')(passport);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());


app.get('*', function(req,res,next){
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});

// express fileupload
// file-upload middleware
app.use(fileUpload());


//set routes
var home = require('./routes/home')
var adminDashboard = require('./routes/admin-dashboard')
var adminCategories = require('./routes/admin-categories')
var adminProducts = require('./routes/admin-products')
var adminOrders = require('./routes/adminOrders')
var cart = require('./routes/cart')
var users = require('./routes/users')
var reviews = require('./routes/reviews')
var order = require('./routes/order')




app.use('/', home)
app.use('/admin/dashboard', adminDashboard)
app.use('/admin/categories', adminCategories)
app.use('/admin/products',adminProducts)
app.use('/admin/orders',adminOrders)
app.use('/cart',cart)
app.use('/user',users)
app.use('/',reviews)
app.use('/order',order)

app.listen(3000, function () {
  console.log('server running on port 3000')
})