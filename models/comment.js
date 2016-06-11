var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Comment(_id, comment) {
  this.name = name;
  this._id = _id;
}

Comment.prototype.save = function(callback){
  var name = this.name,
      _id = this._id;

  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.update({
        new ObjectID(_id)
      }, {
        $push: {"comments": comment}
      } , function (err) {
          mongodb.close();
          if (err) {
            return callback(err);
          }
          callback(null);
      });
    });
  });
};

module.exports = Comment;
