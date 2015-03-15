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
        var ind = ['Health', 'Technology', 'Education', 'Finance', 'Travel'];

        res.render('new-idea', {action: '/new-idea', industries: ind, 
            message: req.flash('new-idea-err')});
    });

    /* Handle idea POST */
    router.post('/new-idea', function(req, res) {
        startup.postIdea(req, function(result) {
            if (result.success) {
                res.redirect('/home');
            } else {
                console.log(result.errmsg);
                req.flash('new-idea-err', result.errmsg);
                res.redirect('/new-idea');
            }
        });
    });

    /* GET the page for an idea */
    router.get('/idea=:id', isAuthenticated, function(req, res) {
        startup.getIdea(req.params.id, function(result) {
            res.render('idea', {user: req.user, idea: result.idea});
        });
    });

    /* GET a form to update an existing idea */
    router.get('/idea=:id/update', isAuthenticated, function(req, res) {
        var id = req.params.id;
        startup.getIdea(id, function(result) {
            var ind = ['Health', 'Technology', 'Education', 'Finance', 'Travel'];
            var idea = result.idea;

            res.render('new-idea', {title: idea.title, 
                description: idea.description, industry: idea.industry,
                action: '/idea='+id+'/update',
                industries: ind,
                message: req.flash('update-idea-err')});
        });
        
    });

    /* Handle update idea POST */
    router.post('/idea=:id/update', function(req,res) {
        var id = req.params.id;
        startup.updateIdea(id, req.body, function(result) {
            if (result.success) {
                res.redirect('/idea=' + id);
            } else {
                console.log(result.errmsg);
                req.flash('update-idea-err', result.errmsg);
                res.redirect('/idea=' + id + '/update');
            }
        });
    });

    /* GET page with list of all ideas */
    router.get('/all', isAuthenticated, function(req, res) {
        startup.getAllIdeas(function(result) {
            res.render('idea-list', {ideas: result.ideas});
        });
    });

    /* Handle an idea DELETE */
    router.get('/idea=:id/delete', function(req, res) {
        var id = req.params.id;
        startup.deleteIdea(id, function(result) {
            if (result.success) {
                res.redirect('/home');
            }
        });
    });
    
    return router;
}
