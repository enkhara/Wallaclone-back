var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

const loginController = require('./controllers/loginController');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mailsRouter = require('./routes/mail');

var app = express();

require('./lib/connectMongoose');
require('dotenv').config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/email', mailsRouter);

/** Rutas del API
 *
 */

app.use(cors());

app.post('/apiv1/auth/signin', loginController.postJWT);
app.post('/apiv1/auth/signup', loginController.post);
app.put('/apiv1/auth/forgot-password', loginController.forgotPassword);
app.put('/apiv1/auth/new-password', loginController.createNewPassword);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (err.array) {
    const errorInfo = err.array({ onlyFirstError: true })[0];
    err.message = `Not valid - ${errorInfo.param} ${errorInfo.msg}`;
    err.status = 422;
  }
  res.status(err.status || 500);
  // si es una petición al API respondo JSON...
  if (isAPIRequest(req)) {
    res.json({ eror: err.message });
    return;
  }

  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page

  res.render('error');
});

function isAPIRequest(req) {
  return req.originalUrl.indexOf('/apiv1/') === 0;
}

module.exports = app;
