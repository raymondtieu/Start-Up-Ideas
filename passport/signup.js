var LocalStrategy   = require('passport-local').Strategy;
var models = require('../models/schema');

module.exports = function(passport){

    passport.use('signup', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {

            findOrCreateUser = function() {
                // find a user in db with username
                models.User.findOne({ 'username' :  username }, function(err, user) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error in SignUp: '+err);
                        return done(err);
                    }

                    // user already exists
                    if (user) {
                        console.log('User already exists: ' + username);
                        return done(null, false, req.flash('message','User already exists'));
                    } else {
                        if (password != req.param('ps-again')) {
                            return done(null, false, req.flash('message', 'Passwords do not match'));
                        }

                        // if there is no user with that username, create one
                        var newUser = new models.User();

                        newUser.username = username;
                        newUser.email = req.param('email');
                        newUser.password = password;



                        // save the user
                        newUser.save(function(err) {
                            if (err){
                                console.log('Error in Saving user: '+err);  
                                throw err;  
                            }
                            console.log('User Registration succesful');    
                            return done(null, newUser);
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