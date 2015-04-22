var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');
var Comment = require('../models/comment');
var express = require('express');
var router = express.Router();

// Auth
router.use(function(req, res, next) {
  var needLogin = ['/post', '/logout', '/upload', '/edit', '/u', '/delete'];
  var skipIfLoggedIn = ['/login', '/reg'];
  if (needLogin.indexOf(req.path) > -1) {
    if (!req.session.user) {
      req.flash('error', '未登录');
      res.redirect('/login');
    } else {
      next();
    }
  } else if (skipIfLoggedIn.indexOf(req.path) > -1) {
    if (req.session.user) {
      req.flash('error', '已经登录');
      res.redirect('back');
    } else {
      next();
    }
  } else {
    next();
  }
});

// Home
router.get('/', function(req, res, next) {
  Post.get(null, function(err, posts) {
    if (err) {
      posts = [];
    }
    //console.log(req.session.user);
    res.render('index', {
      title: 'Home',
      user: req.session.user,
      posts: posts,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

// Register
router.get('/reg', function(req, res, next) {
  res.render('reg', {
    title: 'Reg',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/reg', function(req, res) {
  var name = req.body.Name;
  var email = req.body.Email;
  var password = req.body.Password;
  var repassword = req.body.Repassword;
  if (password != repassword) {
    req.flash('error', '密码不一致');
    return res.redirect('/reg');
  }
  var md5 = crypto.createHash('md5');
  var password = md5.update(password).digest('hex');
  var newUser = new User({
    name: name,
    password: password,
    email: email
  });
  User.get(newUser.name, function(err, user) {
    if (err) {
      req.flash('error', err);
      res.redirect('/reg');
    }
    if (user) {
      req.flash('error', '用户已经存在');
      res.redirect('/reg');
    }
    newUser.save(function(err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');
      }
      req.session.user = user;
      req.flash('success', '注册成功');
      res.redirect('/');
    });
  });
});

// Login
router.get('/login', function(req, res, next) {
  res.render('login', {
    title: 'Login',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/login', function(req, res) {
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.Password).digest('hex');

  User.get(req.body.Name, function(err, user) {
    if (!user) {
      req.flash('error', '用户不存在');
      return res.redirect('/login');
    }
    if (password != user.password) {
      req.flash('error', '密码错误');
      return res.redirect('/login');
    }
    req.session.user = user;
    console.log(req.session.user);
    req.flash('success', '登录成功');
    res.redirect('/');
  });
});

// Logout
router.get('/logout', function(req, res, next) {
  req.session.user = null;
  req.flash('success', '登出成功');
  res.redirect('/');
});

// Post
router.get('/post', function(req, res, next) {
  res.render('post', {
    title: 'Post',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/post', function(req, res) {
  var currentUser = req.session.user;
  var post = new Post(currentUser.name, req.body.title, req.body.post);
  post.save(function(err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', '发表成功');
    res.redirect('/');
  });
});

// Upload
router.get('/upload', function(req, res) {
  res.render('upload', {
    title: 'Upload',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/upload', function(req, res, next) {
  req.flash('success', 'Upload success!');
  res.redirect('/upload');
});

// Show
router.get('/u/:name', function(req, res) {
  User.get(req.params.name, function(err, user) {
    if(!user) {
      req.flash('error', '用户不存在');
      return res.redirect('/');
    }
    Post.get(user.name, function(err, posts) {
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('user', {
        title: user.name,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
});
router.get('/d/:day', function(req, res) {
  User.get(req.params.day, function(err, user) {
    if(!user) {
      req.flash('error', '日期错误');
      return res.redirect('/');
    }
    Post.get()

  })
})
router.get('/u/:name/:day/:title', function(req, res) {
  Post.getOne(req.params.name, req.params.day, req.params.title, function(err, post) {
    if(err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('article', {
      title: req.params.name,
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
    //console.log(post);

  });
});
router.post('/u/:name/:day/:title', function(req, res) {
  var date = new Date();
  var time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
             date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  var comment = {
    name: req.body.name,
    email: req.body.email,
    url: req.body.url,
    time: time,
    content: req.body.content
  };
  //console.log(comment);
  var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
  newComment.save(function(err) {
    if(err) {
      req.flash('error', '留言失败');
      return res.redirect('back');
    }
    req.flash('success', '留言成功');
    res.redirect('back');
  })
})
// Edit
router.get('/edit/:name/:day/:title', function(req, res, next) {
  var currentUser = req.session.user;
  Post.edit(currentUser.name, req.params.day, req.params.title, function(err, post) {
    if(err) {
      req.flash('error', err);
      return res.redirect(back);
    }
    res.render('edit', {
      title: 'Edit',
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});
router.post('/edit/:name/:day/:title', function(req, res) {
  var currentUser = req.session.user;
  Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function(err) {
    var goUrl = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
    if(err) {
      req.flash('error', err);
      return res.redirect(goUrl);
    }
    req.flash('success', "Edit Success!");
    res.redirect(goUrl);
  })
})
//Delete
router.get('/delete/:name/:day/:title', function(req, res) {
  var currentUser = req.session.user;
  Post.delete(currentUser.name, req.params.day, req.params.title, function(err) {
    if(err) {
      req.flash('error', err);
      return res.redirect('back');
    }
    req.flash('success', '删除成功');
    console.log(currentUser);
    res.redirect('/');
  });
});

router.use(function (req, res) {
    res.render("404");
  });
module.exports = router;
