var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var commentSchema = mongoose.Schema({
  writer: { 
    type: Schema.Types.ObjectId, ref: 'User' 
  },
  title: {type: String, default: ""},
  email: {type: String, default: ""},
  content: {type: String, default: ""}
}, 
{
  timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
