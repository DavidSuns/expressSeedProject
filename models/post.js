// var mongodb = require('./db.js');
var pool = require('./pool.js');
var ObjectID = require('mongodb').ObjectID;
var markdown = require('markdown').markdown;
var Comment = require('../models/comment.js');

function Post(name, title, head, tags, post) {
  this.name = name;
  this.head = head;
  this.title = title;
  this.post = post;
  this.tags = tags;
};

Post.prototype.save = function (callback) {
  var date = new Date();
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
  }

  var post = {
      name: this.name,
      head: this.head,
      time: time,
      title: this.title,
      tags: this.tags,
      post: this.post,
      pv: 0,
      reprint_info: {},
      comments: []
  };

  pool.acquire(function (err, db) {
   if (err) {
     return callback(err);
   }
   db.collection('posts', function (err, collection) {
     if (err) {
       pool.release(db);
       return callback(err);
     }
     collection.insert(post, {
       safe: true
     }, function (err) {
       pool.release(db);
       if (err) {
         return callback(err);
       }
       callback(null);
     });
   });
 });
};

Post.getTen = function(name, page, callback) {
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      collection.count(query, function(err, total) {
        collection.find(query, {
          skip: (page-1) * 10,
          limit: 10
        }).sort({
          time: -1
        }).toArray(function(err, docs) {
          pool.release(db);
          if(err) {
            return callback(err);
          }
          docs.forEach(function (doc) {
            doc.post = markdown.toHTML(doc.post);
          });
          callback(null, docs, total);
        });
      });
    });
  });
};

Post.getOne = function(_id, callback) {
  pool.acquire(function(err, db) {
    if(err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if(err) {
        pool.release(db);
        return callback(err);
      }
      collection.findOne({
      "_id": new ObjectID(_id)
     }, function (err, doc) {
       if (err) {
         pool.release(db);
         return callback(err);
       }
       if (doc) {
         collection.update({
          "name": name,
          "time.day": day,
          "title": title
          }, {
            $inc: {"pv": 1}
          }, function (err) {
            pool.release(db);
            if (err) {
              return callback(err);
            }
          });
          doc.post = markdown.toHTML(doc.post);
          doc.comments.forEach(function (comment) {
            comment.content = markdown.toHTML(comment.content);
          });
        }
       callback(null, doc);
     });
   });
 });
};

Post.edit = function(_id, callback) {
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);
      }
      collection.findOne({
        "_id": new ObjectID(_id)
      }, function (err, doc) {
        pool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null, doc);//return markdown format
      });
    });
  });
};

Post.update = function(_id, post, callback) {
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);
      }
      collection.update({
        "_id": new ObjectID(_id)
      }, {
        $set: {post: post}
      }, function (err) {
        pool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

Post.remove = function(_id, callback) {
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);
      }
      collection.remove({
        "_id": new ObjectID(_id)
      }, {
        w: 1
      }, function (err) {
        pool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

Post.getArchive = function(callback) {
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);
      }
      collection.find({}, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        pool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

Post.getTags = function(callback) {
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);
      }
      collection.distinct("tags", function (err, docs) {
        pool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

Post.getTag = function(tag, callback) {
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        pool.release(db);
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
      }).toArray(function (err, docs) {
        pool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

Post.search = function(keyword, callback) {
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);
      }
      var pattern = new RegExp(keyword, "i");
      collection.find({
        "title": pattern
      }, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        pool.release(db);
        if (err) {
         return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

Post.reprint = function(reprint_from, reprint_to, callback) {
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);
      }
      collection.findOne({
        "name": reprint_from.name,
        "time.day": reprint_from.day,
        "title": reprint_from.title
      }, function (err, doc) {
        if (err) {
          pool.release(db);
          return callback(err);
        }

        var date = new Date();
        var time = {
            date: date,
            year : date.getFullYear(),
            month : date.getFullYear() + "-" + (date.getMonth() + 1),
            day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
            minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
        }

        delete doc._id;

        doc.name = reprint_to.name;
        doc.head = reprint_to.head;
        doc.time = time;
        doc.title = (doc.title.search(/[转载]/) > -1) ? doc.title : "[转载]" + doc.title;
        doc.comments = [];
        doc.reprint_info = {"reprint_from": reprint_from};
        doc.pv = 0;

        collection.update({
          "name": reprint_from.name,
          "time.day": reprint_from.day,
          "title": reprint_from.title
        }, {
          $push: {
            "reprint_info.reprint_to": {
              "name": doc.name,
              "day": time.day,
              "title": doc.title
          }}
        }, function (err) {
          if (err) {
            pool.release(db);
            return callback(err);
          }
        });

        collection.insert(doc, {
          safe: true
        }, function (err, post) {
          pool.release(db);
          if (err) {
            return callback(err);
          }
          callback(err, post[0]);
        });
      });
    });
  });
};

Post.remove = function(_id, callback) {
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);
      }
      collection.findOne({
        "_id": new ObjectID(_id)
      }, function (err, doc) {
        if (err) {
          pool.release(db);
          return callback(err);
        }
        var reprint_from = "";
        if (doc.reprint_info.reprint_from) {
          reprint_from = doc.reprint_info.reprint_from;
        }
        if (reprint_from != "") {
          collection.update({
            "name": reprint_from.name,
            "time.day": reprint_from.day,
            "title": reprint_from.title
          }, {
            $pull: {
              "reprint_info.reprint_to": {
                "name": name,
                "day": day,
                "title": title
            }}
          }, function (err) {
            if (err) {
              pool.release(db);
              return callback(err);
            }
          });
        }

        collection.remove({
          "_id": new ObjectID(_id)
        }, {
          w: 1
        }, function (err) {
          pool.release(db);
          if (err) {
            return callback(err);
          }
          callback(null);
        });
      });
    });
  });
};

module.exports = Post;
