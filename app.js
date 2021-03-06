var express = require('express');
var path = require('path');
var swig = require('swig');
var multer = require('multer');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ueditor = require('ueditor');
var flash = require('connect-flash');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
var users = require('./routes/users');
var settings = require('./settings');

var app = express();

// view engine setup
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('view catch', false);
swig.setDefaults({ autoescape: false });
app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(multer({
  dest: './public/images',
  rename: function(fieldname, filename) {
    return filename;
  }
}));

app.use('/ueditor/ue', ueditor(path.join(__dirname, 'public'), function(res, req, next) {
  if(req.query.action === 'uploadimage') {
    var foo = req.ueditor;
    var date = new Date();
    var imagename = req.ueditor.filename;

    var img_url = '/images/ueditor/';
    req.ue_up(img_url);
  }
  else if(req.query.action === 'listimage') {
    var die_url = '/images/ueditor/';
    res.ue_list(die_url);
  }
  else {
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/ueditor/ueditor.config.json')
  }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30
  },
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.post
  }),
  resave: true,
  saveUninitialized: true
}));


app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
