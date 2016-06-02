var express = require('express');
var path = require('path');
var app = express();
var logger = require('express-logger');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var router = express.Router();
var routes = require('./routes/index.js');

var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logger({path: path.join(__dirname, 'logfile.txt')}));
app.use(express.static(__dirname + '/public'));

routes(router, app);

app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});

app.listen(app.get('port'));
