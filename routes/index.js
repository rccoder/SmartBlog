var crypto = require('crypto');
var	User = require('../models/user');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/reg', function(req, res, next) {
	res.render('reg', { title: 'Reg'});
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
	res.render('login', { title: 'Login'});
});
router.post('/login', function(req, res) {

});
router.get('/post', function(req, res, next) {
	res.render('/post', { title: 'Post'});
});
router.post('/post', function(req, res) {

});
router.get('/logout', function(req, res, next) {

});
module.exports = router;
