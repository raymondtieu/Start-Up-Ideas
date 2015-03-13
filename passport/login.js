var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function(passport) {
    
        passport.use('login', new LocalStrategy({
            passReqToCallback: true
        },

        function(req, username, password, done) {
            // Check if user exists
            User.findOne({'username': username},
                function(err, user) {
                    if (err)
                        return done(err);

                    // User doesn't exist
                    if (!user) {
                        console.log("User not found: " + username);
                        return done(null, false, req.flash('message', "User not found."));
                    }

                    // Wrong password
                    if (user.password != password) {
                        console.log("Invalid password");
                        return done(null, false, req.flash('message', "Invalid password"));
                    }

                    console.log("Successful authentication");
                    // Return user on sucessful login
                    return done(null, user);
                }
            );
        })
    );
}
