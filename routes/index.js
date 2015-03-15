var express = require('express');
var router = express.Router();

var startup = require('./start-up');

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

    /* GET home page */
    router.get('/home', isAuthenticated, function(req, res){
        startup.getIdeasByUser(req.user.username, function(result) {
            ideas = result.ideas;
            res.render('home', {user: req.user, ideas: ideas});
        });
    });

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

    /*  GET new start-up idea page */
    router.get('/new-idea', isAuthenticated, function(req, res) {
        res.render('new-idea');
    });

    /* Handle idea POST */
    router.post('/new-idea', function(req, res) {
        startup.postIdea(req, function(result) {
            if (result.success) {
                res.redirect('/home');
            } else {
                console.log(result.message);
                req.flash('message', result.message);
                res.render('new-idea', {
                    message: req.flash('message')
                });
            }
        });
    });

    /* GET page with list of all ideas */
    router.get('/all', isAuthenticated, function(req, res) {
        startup.getAllIdeas(function(result) {
            ideas = result.ideas;
            res.render('idea-list', {ideas: ideas});
        });
    });

    return router;
}
