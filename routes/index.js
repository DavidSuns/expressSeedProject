module.exports = function(router, app) {

  router.route('/').get(function (req, res) {
    res.render('index', { title: '主页' });
    // res.render('index', {title: 'demo', message: 'Home'});
    // var page = req.query.p ? parseInt(req.query.p) : 1;
    // Post.getTen(null, page, function (err, posts, total) {
    //   if (err) {
    //     posts = [];
    //   }
    //   res.render('index', {
    //     title: '主页',
    //     posts: posts,
    //     page: page,
    //     isFirstPage: (page - 1) == 0,
    //     isLastPage: ((page - 1) * 10 + posts.length) == total,
    //     user: req.session.user,
    //     success: req.flash('success').toString(),
    //     error: req.flash('error').toString()
    //   });
    // });
  });

  router.route('/register').get(function(req, res) {
     res.render('register', { title: '注册' });
  })
  .post(function(req, res) {

  });

  router.route('/login').get(function(req, res) {
    res.render('login', { title: '登录' });
  })
  .post(function(req, res) {

  });

  router.route('/logout').get(function(req, res) {

  });

  router.route('/post').get(function(req, res) {
    res.render('post', { title: '发表' });
  })
  .post(function(req, res) {

  });

  router.route('*').get(function(request, res) {
    res.end("404!");
  });

  app.use('/',router);
};
