var express = require('express');
var router = express.Router();
var startup = require('../models/start-up');

/* If the user is not authenticated, redirect to login page */
var isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

module.exports = function(passport) {
    /* GET login page */
    router.get('/', function(req, res) {
        res.render('index', { message: req.flash('message') });
    });

    /* Handle login POST */
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/home',
        failureRedirect: '/',
        failureFlash : true  
    }));

    /* GET registration page */
    router.get('/signup', function(req, res){
        res.render('signup',{message: req.flash('message')});
    });

    /* Handle registration POST */
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/home',
        failureRedirect: '/signup',
        failureFlash : true  
    }));

    /* Handle logout */
    router.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    /* GET home page */
    router.get('/home', isAuthenticated, function(req, res) {
        res.render('home', {user: req.user});
    });

    /* GET all ideas in database */
    router.get('/all-ideas', function(req, res) {
        startup.getAllIdeas(function(result) {
            res.send(result);
        });
    });

    /* Handle idea POST */
    router.post('/new-idea', function(req, res) {
        title = req.query.title;
        description = req.query.description;
        industry = req.query.industry;
        keywords = req.query.keywords;

        startup.postIdea(req.user, title, description, industry, keywords,
            function(result) {
                res.send(result);
            });
    });

    /* GET the page for an idea */
    router.get('/idea=:id', isAuthenticated, function(req, res) {
        res.render('idea', {user: req.user});
    });

    /* GET an idea given an id  */
    router.get('/idea', isAuthenticated, function(req, res) {
        var id = req.query.id;

        startup.getIdea(id, function(result) {
            res.send(result);
        });
    })

    /* Handle update idea PUT */
    router.put('/idea=:id/update', isAuthenticated, function(req,res) {
        var id = req.params.id;

        title = req.query.title;
        description = req.query.description;
        industry = req.query.industry;
        keywords = req.query.keywords;

        startup.updateIdea(id, title, description, industry, keywords, function(result) {
            res.send(result);
        });
    });

    /* Handle an idea DELETE */
    router.delete('/idea=:id/delete', isAuthenticated, function(req, res) {
        var id = req.params.id;
        startup.deleteIdea(id, function(result) {
            if (result.success) {
                res.send(result);
            }
        });
    });

    /* Handle like idea POST */
    router.post('/idea=:id/like', isAuthenticated, function(req, res) {
        var id = req.params.id;

        console.log(id);

        startup.addPreference(id, req.user.email, 1, function(result) {
            if (result.success) {
                res.send(result);
            }
        });
    });

    /* Handle dislike idea POST */
    router.post('/idea=:id/dislike', isAuthenticated, function(req, res) {
        var id = req.params.id;
        startup.addPreference(id, req.user.email, -1, function(result) {
            if (result.success) {
                res.send(result);
            }
        });
    });

    /* GET all preferences for an idea */
    router.get('/preferences', isAuthenticated, function(req, res) {
        var id = req.query.id;

        startup.getPreferences(id, function(result) {
            res.send(result);
        })
    });

    /* GET all preferences for all ideas */
    router.get('/all-preferences', isAuthenticated, function(req, res) {
        startup.getAllPreferences(function(result) {
            res.send(result);
        });
    });

    /* GET the current user */
    router.get('/user', isAuthenticated, function(req, res) {
        res.send({user: req.user});
    });


    /* GET all ideas between the start and end date */
    router.get('/get-ideas-between', isAuthenticated, function(req, res) {
        var k = req.query.k;
        var start = req.query.start;
        var end = req.query.end;

        startup.getIdeasBetween(k, start, end, function(result) {
            res.send(result);
        });
    });

    /* GET the overall preference for an idea given an id */
    router.get('/get-overall', isAuthenticated, function(req, res) {
        var id = req.query.id;

        startup.getOverall(id, function(result) {
            res.send(result);
        });
    })
    
    return router;
}

