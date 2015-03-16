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

    /* GET all ideas by current user */
    router.get('/my-ideas', isAuthenticated, function(req, res) {
        startup.getIdeasByUser(req.user, function(result) {
            res.send(result);
        })
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
        res.render('idea');
    });

    /* GET an idea and preferences given an id  */
    router.get('/idea', isAuthenticated, function(req, res) {
        var id = req.query.id;

        startup.getIdea(req.user, id, function(result) {
            res.send(result);
        });
    })

    /* Handle update idea PUT */
    router.put('/idea=:id/update', function(req,res) {
        var id = req.params.id;

        title = req.query.title;
        description = req.query.description;
        industry = req.query.industry;
        keywords = req.query.keywords;

        startup.updateIdea(id, title, description, industry, keywords, function(result) {
            res.send(result);
        });
    });

    /* GET page with list of all ideas */
    router.get('/all', isAuthenticated, function(req, res) {
        startup.getAllIdeas(function(result) {
            res.render('idea-list', {ideas: result.ideas});
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

    /* GET all preferences of an idea */
    router.get('/preferences', isAuthenticated, function(req, res) {
        var title = req.query.title;

        startup.getPreferences(title, function(result) {
            res.send(result);
        })
    });
    
    return router;
}
