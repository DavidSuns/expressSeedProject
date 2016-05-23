var express = require('express');
var app = express();
var router = express.Router();
var routes = require('routes/index.js');

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.methodOverride());
// app.use(app.router);
app.use(express.static(__dirname + '/public'));

routes(router, app);

app.listen(app.get('port'));
