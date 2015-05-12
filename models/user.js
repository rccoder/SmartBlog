var mongodb = require('./db');
var crypto = require('crypto');
function User(user) {
  this.name = user.name,
  this.password = user.password,
  this.email = user.email;
}

module.exports = User;

User.prototype.save = function(callback) {
  var md5 = crypto.createHash('md5');
  var email_md5 = md5.update(this.email.toLowerCase()).digest('hex');
  var head = 'http://www.gravatar.com/avatar/' + email_md5 + '?=48';
  var user = {
    name: this.name,
    password: this.password,
    email: this.email,
    head: head
  };

  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('user', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.insert(user, {
        safe: true
      }, function(err, user) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, user[0]);
      });
    });
  });
};

User.get = function(name, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('user', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.findOne({
        name: name
      }, function(err, user) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, user);
      });
    });
  });
};
