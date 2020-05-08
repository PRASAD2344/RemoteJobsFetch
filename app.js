var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Parser = require('rss-parser');
var parser = new Parser();
var app = express();
var moment = require('moment');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', async (req,res) => {
  try{
    var now = moment(new Date());
    let response = [];
    let feed = await parser.parseURL('https://weworkremotely.com/categories/remote-programming-jobs.rss');
    feed.items.forEach(o => {
      const pubDate = moment(o.pubDate);
      if(now.diff(pubDate, 'hours') <= 24){//Published in last 24 hours
        response.push({
          title: o.title,
          link: o.link,
        });
      }
    });
    res.status(200).send(response);
  }catch(ex){
    console.log(ex);
    res.status(500).send(ex);
  }
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
  res.send('error');
});

module.exports = app;
