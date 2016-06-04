var express = require('express');
var path = require('path');
var app = express();
var logger = require('express-logger');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var router = express.Router();

var routes = require('./routes/index.js');
var settings = require('./settings');

var fs = require('fs');
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(flash());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(favicon(__dirname + '/public/images/favicon.jpeg'));
app.use(logger({path: path.join(__dirname, 'logfile.txt')}));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    url: "mongodb://" + settings.host + "/" + settings.db
  })
}));

routes(router, app);

app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});

app.listen(app.get('port'));
