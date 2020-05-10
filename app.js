//docker run -p 2344:2344 -d rjobpull
//docker build -t rjobpull .
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
    let response = [];

    let weWorkItems = await weWorkRemote();
    response.push(...weWorkItems);

    let remoteOkItems = await remoteOk();
    response.push(...remoteOkItems);

    res.status(200).send(response);
  }catch(ex){
    console.log(ex);
    res.status(500).send(ex);
  }
});

async function remoteOk(){
  let now = moment(new Date());
  let feed = await parser.parseURL('https://remoteok.io/remote-jobs.rss');
  return feed.items
            .filter(o => now.diff(moment(o.pubDate), 'hours') <= 24)
            .map(getCorrespondingItem);
}

async function weWorkRemote(){
  let now = moment(new Date());
  let feed = await parser.parseURL('https://weworkremotely.com/categories/remote-programming-jobs.rss');
  return feed.items
            .filter(o => now.diff(moment(o.pubDate), 'hours') <= 24)
            .map(getCorrespondingItem);
}

function getCorrespondingItem(item){
  return {
    title: item.title.replace(/[\n\r\t]/g,''),
    link: item.link,
  }
}

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
