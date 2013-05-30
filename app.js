
/**
 * Module dependencies.
 */
var flash = require('connect-flash')
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var LocalStrategy = require('passport-local').Strategy;
var login = require('./routes/login');
var photos = require('./routes/photos');
var os = require('os');
var gallery = require('./gallery');
var util = require('util');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser('secret'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({secret: 'secret secret'})); // must be before passport.session
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(gallery.middleware({static: 'public', directory: '/photosroot', rootURL: "/gallery"}));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//---------------------------------  These have to be the last two app.use lines --------------
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


//--------------  setup passport  ----------------
passport.use(new LocalStrategy( function(username, password, done) {
  console.log("username: " + username + " password: " + password);
  if( username == "foo" && password == "bar") {
    console.log("authenticated");
    return done(null, {username: username, firstname: 'Bob', lastname: 'Builder'});

  } else {
    console.log("failed auth");
    return done(null, false, {message: 'Incorrect login'});
  }
}));
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);

});


//-------------------------------  Setup Routes ------------
//app.get('/', routes.index);
//app.get('/', passport.authenticate('local', {successRedirect: '/photos',
//    failureRedirect: '/login',
//    failureFlash: true}));

app.get('/', ensureLoggedIn('/login', function(req,res) {
  res.send('Hello ' + req.user.username);
}));

app.get('/users', user.list);
app.get('/login', login.login);
app.get('/logout', function(req,res) {
  req.logout();
  res.redirect('/login');
});
app.get('/photos', ensureLoggedIn('/login'), function(req,res) {
  photos.clearMap();
  photos.list(req,res);
});
app.get('/photo' , ensureLoggedIn('/login'), function(req,res) {
  photos.listByDay(req,res);
});
app.get('/gallery*' , ensureLoggedIn('/login'), function(req,res) {
  var data = req.gallery;
  data.layout = false; // Express 2.5.* support, don't look for layout.ejs

  res.render(data.type + '.ejs', data);
});


//app.get('/photos', ensureLoggedIn('/login', photos.list));
//app.get('/photos', photos.list);


app.post('/login', passport.authenticate('local', {successRedirect: '/photos',
                                                   failureRedirect: '/login',
                                                   failureFlash: true}));


//--- find host ip address
var hostIpAddress = "";
var ifaces=os.networkInterfaces();
for (var dev in ifaces) {
  var alias=0;
  ifaces[dev].forEach(function(details){
    if (details.family=='IPv4') {
      hostIpAddress = details.address
      console.log(dev+(alias?':'+alias:''),details.address);
      ++alias;
    }
  });
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
