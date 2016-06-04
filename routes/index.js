var crypto = require('crypto');
var User = require('../models/user.js');

module.exports = function(router, app) {

  router.route('/').get(function (req, res) {
    res.render('index', {
      title: '主页',
      user: req.session.user,
      success: req.flash('success').toString(),
      fail: req.flash('fail').toString()
   });
  });

  router.route('/register').get(function(req, res) {
     res.render('register', { title: '注册' });
  })
  .post(function(req, res) {
    var name = req.body.name,
        email = req.body.email,
        password = req.body.password,
        password_re = req.body['password-repeat'];

    if (password_re != password) {
      req.flash('error', '两次输入的密码不一致!');
      return res.redirect('/register');//返回注册页
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

  router.route('/login').get(function(req, res) {
    res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()});
    });
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

  router.route('/logout').get(function(req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');//登出成功后跳转到主页
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
