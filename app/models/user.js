var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    userid: String,
    email: String,
    password: String

}, {
    toJSON: {
        transform: function (doc, ret) {
          delete ret.password;
        }
      }
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
var User = mongoose.model('User', userSchema);
module.exports = User;

initAdminUser = function() {
  User.findOne({userid: "igloo"}).lean().exec(function(err, user) {
    if(!err && !user) {
      var admin = new User();
      admin.userid = "igloo";
      admin.password = admin.generateHash("igloo");
      admin.save();
    }
  })
    
}
initAdminUser();