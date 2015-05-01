var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(name, title, tags, post) {
  this.name = name,
  this.title = title,
  this.tags = tags,
  this.post = post;
}

module.exports = Post;

Post.prototype.save = function(callback) {
  var date = new Date();
  var time = {
    date: date,
    year: date.getFullYear(),
    month: date.getFullYear() + '-' + (date.getMonth() + 1),
    day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
    date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
  };
  var post = {
    name: this.name,
    time: time,
    title: this.title,
    tags: this.tags,
    post: this.post,
    comments: []
  };
  //console.log(post.time);
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.insert(post, {
        safe: true
      }, function(err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

Post.get = function(name, page, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      collection.count(query, function (err, total) {
        collection.find(query, {
          skip: (page-1)*10,
          limit: 10
        }).sort({
          time: -1
        }).toArray(function (err, docs) {
          mongodb.close();
          if(err) {
            return callback(err);
          }
          callback(null, docs, total);
        });
      });
      /*
      collection.find(query).sort({
        time: -1
      }).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        docs.forEach(function(doc) {
          //doc.post = markdown.toHTML(doc.post);
        });
        callback(null, docs);
      });
*/
    });
  });
};

Post.getOne = function(name, day, title, callback) {
  mongodb.open(function(err, db) {
    if(err) {
      mongodb.close();
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if(err) {
        mongodb.close();
        return callback(err);
      }
      collection.findOne({
        "name": name,
        "time.day": day,
        "title": title
      }, function(err, doc) {
        mongodb.close();
        if(err) {
          return callback(err);
        }
        //doc.post = markdown.toHTML(doc.post);
        //console.log(doc.comments);
        if(doc.comments) {
          doc.comments.forEach(function (comment) {
            comment.content = markdown.toHTML(comment.content);
          });
        }
        callback(null, doc);
      });
    });
  });
};

Post.edit = function(name, day, title, callback) {
  mongodb.open(function(err, db) {
    if(err) {
      mongodb.close();
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if(err) {
        mongodb.close();
        return callback(err);
      }
      collection.findOne({
        "name": name,
        "time.day": day,
        "title": title
      }, function(err, doc) {
        mongodb.close();
        if(err) {
          return callback(err);
        }
        callback(null, doc);
      });
    });
  });
};

Post.update = function(name, day, title, tags, post, callback) {
  mongodb.open(function(err, db) {
    if(err) {
      mongodb.close();
      return callback(err);
    }
    console.log(tags);
    db.collection('posts', function(err, collection) {
      if(err) {
        mongodb.close();
        return callback(err);
      }
      collection.update({
        "name": name,
        "time.day": day,
        "title": title
      }, {
        $set: {post: post},
        $set: {tags: tags}
      }, function(err) {
        mongodb.close();
        if(err) {
          return callback(err)
        }
        callback(null);
      });
    });
  });
};

Post.delete = function(name, day, title, callback) {
  mongodb.open(function(err, db) {
    if(err) {
      mongodb.close();
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if(err) {
        mongodb.close();
        return callback(err);
      }
      collection.remove({
        "name": name,
        "time.day": day,
        "title": title
      }, {
        w: 1
      }, function(err) {
        mongodb.close();
        if(err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

Post.search = function(keyword, callback) {
  mongodb.open(function(err, db) {
    if(err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if(err) {
        mongodb.close();
        return callback(err);
      }
      var pattern = new RegExp(keyword, 'i');
      collection.find({
        'title': pattern
      }, {
        'name': '1',
        'time': '1',
        'title': '1'
      }).sort({
        time: -1
      }).toArray(function(err, docs) {
        mongodb.close();
        if(err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

Post.getTags = function(callback) {
  mongodb.open(function(err, db) {
    if(err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if(err) {
        mongodb.close();
        return callback(err);
      }
      collection.distinct("tags", function(err, docs) {
        mongodb.close();
        if(err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

Post.getTag = function(tag, callback) {
  mongodb.open(function(err, db) {
    if(err) {
      mongodb.close();
      return callback(err);
    }
    db.collection("posts", function(err, collection) {
      if(err) {
        mongodb.close();
        return callback(err);
      }
      collection.find({
        "tags": tag
      }, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function(err, docs) {
        mongodb.close();
        if(err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};