
var express = require('express');
var http = require('http');
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
methodOverride = require('method-override'),
session = require('express-session'),
swig = require('swig'),
morgan = require('morgan'), 
util = require('util'),
passport = require('passport'),
PixelPinStrategy = require('Passport-PixelPin-OpenIDConnect').Strategy;

passport.use(new PixelPinStrategy({
    clientID: "MSG1BBJCCMMOYB6YZOMKPK4TWESEMU",
    clientSecret: "xjDmTt2CrNgf*1Rb86-9Ptj0Z6QVlr",
    responseType: "code",
    callbackURL: "http://local.nodejs.co.uk/auth/pixelpin/callback"
},

function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
            return done(null, profile);
        });
    }

));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done){
    done(null, obj);
});

var app = express();

// configure Express
app.set('views', __dirname + '/view');
app.set('view engine', 'ejs');
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('method-override')());
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

//app.use(app.router);
app.use(express.static(__dirname + '/public'));

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/account');
}

app.get('/', function(req,res,profile){
	res.render('index', { user: req.user});
});

app.get('/account', isAuthenticated, function(req, res, next){
	res.render('account', { user: req.user});
});

app.get('/login', function(req,res){
	res.render('login', { user: req.user});
});

app.get('/register', function(req,res){
	res.render('register', { user: req.user});
});

app.get('/layout', function(req,res){
	res.render('layout', { user: req.user});
});

app.get('/logout', function(req,res){
	req.logout();
	res.redirect('/');
});

app.get('/auth/pixelpin',
    passport.authenticate('pixelpin', {scope: ['profile', 'email', 'phone', 'address']}),
    function(req, res){

});

app.get('/auth/pixelpin/callback',
    passport.authenticate('pixelpin', {failureRedirect: 'login'}),
    function(req, res){
        res.redirect('/layout');
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticate(req, res, next) {
	if (req.isAuthenticated()) { return next();}
	res.redirect('/login')
}

http.createServer(app).listen(80);