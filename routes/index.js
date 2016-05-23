module.exports = function(router, app) {

  router.route('/').get(function (req, res) {
    res.render('index', {title: 'demo', message: 'Home'});
  });
  router.route('/customer').get(function(req, res){
    res.send('customer page');
  });
  router.route('/admin').get(function(req, res){
    res.send('admin page');
  });
  router.route('*').get(function(request, res) {
    res.end("404!");
  });

  app.use('/',router);
};
