var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');


var db = require('monk')('localhost/userDB') || ('monk')(process.env.MONGO_URI)
var Users = db.get('user')

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.user) {
    res.render('success', {user: req.session.user, errors: []})
  }
  res.render('index', { title: 'Express', errors: []});
});


router.post('/', function(req, res, next){
  var errors = [];  
  if (req.body.email.length === 0 || req.body.email.indexOf('@') === -1) {
    errors.push('Email cannot be blank and must contain an @ character');
  }
  if (req.body.password.length < 8) {
    errors.push('Password must be a miniumum of 8 characters')
  }
  if (req.body.password !== req.body.confirmPassword) {
    errors.push('Passwords do not match');
  }
  if (errors.length > 0) {
    res.render('index', {errors: errors});
  }
  else {
      Users.findOne({email: req.body.email}, function(err, user){
        var errors = [];
          if (user) {
            errors.push('This email is already signed up');
            res.render('index', {errors: errors});
          }
          else {
            var hash = bcrypt.hashSync(req.body.password, 10);
            Users.insert({email: req.body.email, password: hash}, function(err, user){
              req.session.user = user;
            res.render('success', {users: user})
            })
          }
      })
  }


})



router.get('/signin', function(req, res, next){
  res.render('signin', {error: []});
})

router.get('/students', function(req, res, next){
  Students.find({}, function(err, student){
    res.render('students', {students: student})
  })
})

router.get('/students/:id', function(req, res, next){
  Students.findOne({_id: req.params.id}, function(err, student){
    res.render('showStudent', {theStudent: student})
  })
})


router.post('/signin', function(req, res, next){
  if (req.session.user) {
    res.render('success', {errors: [], user: req.session.user, students: []})
  }
  var pass = req.body.password;
  Users.findOne({email: req.body.email}, function(err, user){
    if (user) {
      if (bcrypt.compareSync(pass, user.password)) {
        req.session.user = user;
        res.render('success', {errors: [], user: req.session.user})
      }
      else {
        res.render('signin', {error: 'Password/Email do not match'})
      }
    }
    else {
        res.render('signin', {error: 'Password/Email do not match'})
    }
  })
})



// var db2 = require('monk')('localhost/studentsDB')
// var Students = db2.get('students')

router.post('/addStudent', function(req, res, next){
  var errors = [];
  if (req.body.name.length === 0) {
    errors.push('Student name cannot be blank');
  }
  if (req.body.phone.length < 7) {
    errors.push('Phone cannot be blank')
  }
  if (errors.length > 0) {
    res.render('success', {errors: errors, user: req.session.user})
  }
  else {
    Users.insert({name: req.body.name,
      phone: req.body.phone}, function(err, student){
        console.log(student);
        res.render('success', {errors: ['You have succesfully added a student'], user: req.session.user})
      })
  }

})







router.get('/logout', function(req, res, next){
  req.session =  null;
  res. render('signin',  {error: []});
})

module.exports = router;
