var crypto = require('crypto');
var	User = require('../models/user');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
  	title: 'Home',
  	user: req.session.user,
  	success: req.flash('success').toString(),
  	error: req.flash('error').toString()
  	 });
});
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
	if(password != repassword) {
		req.flash('error', '密码不一致');
		return res.redirect('/reg');
	}
	var md5 = crypto.createHash('md5');
	var password = md5.update(password).digest('hex');
	var newUser = new User ({
		name: name,
		password: password,
		email: email
	});
	User.get(newUser.name, function(err, user) {
		if(err) {
			req.flash('error', err);
			res.redirect('/reg');
		}
		if(user) {
			req.flash('error', '用户已经存在');
			res.redirect('/reg');
		}
		newUser.save(function(err, user) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			req.session.user = user;
			req.flash('success', '注册成功');
			res.redirect('/');
		});
	});
});
router.get('/login', function(req, res, next){
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
		if(!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/login');
		}
		if(password != user.password) {
			req.flash('error', '密码错误');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success', '登录成功');
		res.redirect('/');
	})
});
router.get('/post', function(req, res, next) {
	res.render('/post', { title: 'Post'});
});
router.post('/post', function(req, res) {

});
router.get('/logout', function(req, res, next) {
	req.session.user = null;
	req.flash('success', '登出成功');
	res.redirect('/');
});
module.exports = router;
