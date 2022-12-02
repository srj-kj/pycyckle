var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var handlebars = require('handlebars');
// var fileUpload = require('express-fileupload')
const swal=require('sweetalert2')

var session = require('express-session');
var db=require('./config/connection')
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');

handlebars.registerHelper('inc',function(value,options){
  return(value)+1
}) 

var Hbs=hbs.create({});
 
Hbs.handlebars.registerHelper('if_eq', function(a, b, opts) {
  if(a == b) // Or === depending on your needs
      return opts.fn(this);
  else
      return opts.inverse(this);
});
 
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials' }))
app.use(session({secret:'key',cookie:{maxAge:1000000},resave:false,saveUninitialized:false}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


db.connect((err)=>{
  if(err) console.log('Connection Error');
  else console.log("Database Connected to port 27017");
});

app.use((req, res, next)=>{
  res.set('cache-control', 'no-store')
  next()
})

app.use('/admin', adminRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


app.get('/*',(req,res)=>{
  res.render('user/404')
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
