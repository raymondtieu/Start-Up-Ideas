var LocalStrategy   = require('passport-local').Strategy;
var models = require('../models/schema');
var validator = require('email-validator');

module.exports = function(passport){

    passport.use('signup', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, callback) {

            findOrCreateUser = function() {
                // find a user in db with the same email
                models.User.findOne({email: new RegExp('^' + username + '$', 'i')}, function(err, user) {
                    // In case of any error, return using the callback
                    if (err){
                        console.log('Error in SignUp: ' + err);
                        return callback(err);
                    }

                    // user already exists
                    if (user) {
                        console.log('User already exists: ' + username);
                        return callback(null, false, req.flash('message','Email is already in use'));
                    } else {
                        // regex for a valid name
                        nameRegex = /^[a-zA-Z]{1,16}$/;

                        // check for a valid username
                        if (!(req.body.name.match(nameRegex))) {
                            return callback(null, false, 
                                req.flash('message', 
                                    'Invalid name'));
                        }

                        // check for valid email
                        var email = username;
                        if (!(validator.validate(email)))
                            return callback(null, false, req.flash('message', 'Invalid email'));


                        // check for matching passwords
                        if (password != req.body.psagain) {
                            return callback(null, false, req.flash('message', 'Passwords do not match'));
                        }

                        
                        // if there is no user with that username, create one
                        var newUser = new models.User();

                        newUser.name = req.body.name;
                        newUser.email = email;
                        newUser.password = password;

                        // save the user
                        newUser.save(function(err) {
                            if (err){
                                console.log('Error in Saving user: '+err);  
                                throw err;  
                            }
                            console.log('User Registration succesful');    
                            return callback(null, newUser);
                        });
                    }
                });
            };
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
        })
    );
}