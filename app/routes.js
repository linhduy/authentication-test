var Comment = require('./models/comment');
var User = require('./models/user');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
module.exports = function(app, passport) {

  // =====================================
  // HOME PAGE (with login links) ========
  // =====================================
  app.get('/', function(req, res) {
      res.render('index.ejs');
  });

  // =====================================
  // LOGIN ===============================
  // =====================================

  app.get('/login', function(req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') }); 
  });

  app.post('/login', function(req, res, next) {
    passport.authenticate('local-login', {session: true}, function(err, user) {
      if (err || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user   : user
        });
      }
      req.login(user, {session: true}, (err) => {
        if (err) {
          res.send(err);
        }
        
        return res.status(200).send(user.toJSON());
      });
    })(req, res);
  });

  // =====================================
  // SIGNUP ==============================
  // =====================================
  app.get('/signup', function(req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  app.get('/profile', isLoggedIn, function(req, res) {
    return res.json({authenticated: true});
  });

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', isLoggedIn, function(req, res) {
    req.logout();
    res.status(400).json({authenticated: false})
  });

  // =====================================
  // USER COMMENT ========================
  // =====================================
  app.get('/comment', isLoggedIn, function(req, res) {
    Comment.find({})
    .populate('writer')
    .lean()
    .exec(function(err, comments) {
      if(err) {
        return res.send({code: 400})
      }
      return res.status(200).json({code: 200, data: comments});
    })
  });
  app.get('/comment/:id', isLoggedIn, function(req, res) {
    const id = req.params.id
    Comment.findById(id)
    .populate('writer')
    .lean()
    .exec(function(err, comment) {
      if(err) {
        return res.status(400).json({err: err})
      }
      return res.status(200).json({code: 200, data: comment});
    })
  });
  app.post('/comment', isLoggedIn, function(req, res) {
    var data = req.body;
    User.findById(data.writer)
    .lean()
    .exec(function(err, user) {
      if(err || !user) {
        return res.status(400).json({err: err})
      }

      var comment = new Comment();
      comment.writer = user._id;
      comment.email = data.email;
      comment.title = data.title;
      comment.content = data.content;
      comment.save(function(err, result) {
        if(err) {
          return res.status(400).json({err: err})
        }
        return res.status(200).json({code: 200, data: result});
      });
    })
    
  });
  app.put('/comment/:id', isLoggedIn, function(req, res) {
    var id = req.params.id;
    var data = req.body;
    Comment.findById(id)
    .exec(function(err, comment) {
      if(err || !comment) {
        return res.status(400).json({err: err})
      }
      comment.title = data.title;
      comment.content = data.content;
      comment.email = data.email;
      comment.save();
      return res.status(200).json({code: 200, data: comment});
    })
  });
  app.delete('/comment/:id', isLoggedIn, function(req, res) {
    var id = req.params.id;
    var data = req.body;
    Comment.findOneAndRemove({_id: id})
    .exec(function(err, comment) {
      if(err) {
          return res.status(400).json({err: err})
      }

      return res.status(200).json({code: 200, data: comment});
    })
  });

  app.get('/comment/writer/:id', isLoggedIn, function(req, res) {
    var id = req.params.id;
    Comment.find({writer: id})
    .populate('writer')
    .lean()
    .exec(function(err, comments) {
      if(err) {
          return res.status(400).json({err: err})
      }
      return res.status(200).json({code: 200, data: comments});
    })
  });
  
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  return res.status(400).json({authenticated: false})
}