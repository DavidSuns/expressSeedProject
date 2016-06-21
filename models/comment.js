var ObjectID = require('mongodb').ObjectID;
var pool = require('./pool.js');

function Comment(_id, comment) {
  this.name = name;
  this._id = _id;
}

Comment.prototype.save = function(callback){
  var name = this.name,
      _id = this._id;

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
        $push: {"comments": comment}
      } , function (err) {
          pool.release(db);
          if (err) {
            return callback(err);
          }
          callback(null);
      });
    });
  });
};

module.exports = Comment;
