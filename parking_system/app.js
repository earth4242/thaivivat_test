var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'bg')));
app.use(express.static(path.join(__dirname, 'frontend'),{index:false}));

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: false
}));

var mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(
    'mongodb://mongo:27017/parking_node',
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

var routingparking = require('./routes');
app.use('/parking', routingparking);

const Parking_status = require('./models/status');

var cron = require('node-cron');
var format = require('date-format');
var dtask = cron.schedule('0 0 0 * * *',async () => {
  var slot = new Parking_status({
    lotsize: 0
  });
  await slot.save();
} , {
   scheduled: true
});
dtask.start();

app.get('*', (req, res,next) => {
  res.sendFile(path.join(__dirname, './frontend', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

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
