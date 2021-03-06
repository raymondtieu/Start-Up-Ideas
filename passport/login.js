var LocalStrategy = require('passport-local').Strategy;
var models = require('../models/schema');

module.exports = function(passport) {
    
        passport.use('login', new LocalStrategy({
            passReqToCallback: true
        },

        function(req, username, password, callback) {
            // Check if user exists
            models.User.findOne({'email': new RegExp('^' + username + '$', 'i')},
                function(err, user) {
                    if (err)
                        return callback(err);

                    // User doesn't exist
                    if (!user) {
                        console.log("User not found: " + username);
                        return callback(null, false, req.flash('message', "User not found."));
                    }

                    // Wrong password
                    if (user.password != password) {
                        console.log("Invalid password");
                        return callback(null, false, req.flash('message', "Invalid password"));
                    }

                    console.log("Successful authentication");
                    // Return user on sucessful login
                    return callback(null, user);
                }
            );
        })
    );
}
