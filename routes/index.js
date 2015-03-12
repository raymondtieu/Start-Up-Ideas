var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({}, {}, function(e, docs) {
        res.render('userlist', {
            "userlist": docs
        });
    });
});

router.get('/register', function(req, res) {
    res.render('register', {title: 'Register New User'});
});

/* POST to register a new user */
router.post('/adduser', function(req, res) {
    var db = req.db;

    // get form values
    var userName = req.body.username;
    var email = req.body.email;

    // set collection
    var collection = db.get('usercollection');

    // submit to db
    collection.insert({
        "name": userName,
        "email": email
    }, function(err, doc) {
        if (err) {
            res.send("Error: Could not register new user");
        } else {

            // redirect to userlist page
            res.location("userlist");

            // forward to success page
            res.redirect("userlist");
        }
    });
});

module.exports = router;
