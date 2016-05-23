var express = require('express');
var path = require('path');
var app = express();
var logger = require('express-logger');
var router = express.Router();
var routes = require('./routes/index.js');

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger({path: path.join(__dirname, 'logfile.txt')}));
app.use(express.static(__dirname + '/public'));

routes(router, app);

app.listen(app.get('port'));
