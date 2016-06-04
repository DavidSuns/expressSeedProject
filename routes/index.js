var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');

module.exports = function(router, app) {

  router.route('/').get(function (req, res) {
    Post.get(null, function (err, posts) {
    if (err) {
      posts = [];
    }
    res.render('index', {
      title: '主页',
      user: req.session.user,
      posts: posts,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  });


  router.route('/register').get(checkNotLogin)
  .get(function(req, res) {
     res.render('register', { title: '注册' });
  })
  .post(function(req, res) {
    var name = req.body.name,
        email = req.body.email,
        password = req.body.password,
        password_re = req.body['password-repeat'];

    if (password_re != password) {
      req.flash('error', '两次输入的密码不一致!');
      return res.redirect('/register');
    }

    var md5 = crypto.createHash('md5'),
    password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name: name,
      password: password,
      email: email
    });

    User.get(newUser.name, function(err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      if(user) {
        req.flash('error', '用户已存在!');
        return res.redirect('/');
      }

      newUser.save(function(err, user) {
        if(err) {
          req.flash('error', err);
          return res.redirect('/register');
        }
        req.session.user = newUser;
        req.flash('success', '注册成功!');
        res.redirect('/');
      });

    })
  });

  router.route('/login').get(checkNotLogin).get(function(req, res) {
    res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()});
  })
  .post(function(req, res) {
    var md5 = crypto.createHash('md5'),
    password = md5.update(req.body.password).digest('hex');
    User.get(req.body.name, function(err, user) {
      if(err) {
        req.flash("error", err);
        return req.redirect('/login');
      }
      if(!user) {
        req.flash("error", "用户不存在");
        return req.redirect('/login');
      }
      if(user.password != password) {
        req.flash("error", "密码错误");
        return req.redirect('/login');
      }

      req.session.user = user;
      req.flash('success', '登陆成功!');
      res.redirect('/');
    });
  });

  router.route('/logout').get(checkLogin)
  .get(function(req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');
  });

  router.route('/post').get(checkLogin)
  .get(function(req, res) {
    res.render('post', { title: '发表' });
  })
  .post(function(req, res) {
    var currentUser = req.session.user;
    var post = new Post(currentUser.name, req.body.title, req.body.post);
    post.save(function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      req.flash('success', '发布成功!');
      res.redirect('/');
    });
  });

  router.route('*').get(function(request, res) {
    res.end("404!");
  });

  app.use('/',router);
};

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '未登录!');
    res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '已登录!');
    res.redirect('back');
  }
  next();
}
