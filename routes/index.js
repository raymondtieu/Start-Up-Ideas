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
        startup.getIdeasByUser(req.user.username, function(result) {
            res.send(result);
        })
    });

    /* Handle idea POST */
    router.post('/new-idea', function(req, res) {
        title = req.query.title;
        description = req.query.description;
        industry = req.query.industry;

        startup.postIdea(req.user.username, title, description, industry, 
            function(result) {
                res.send(result);
            });
    });

    /* GET the page for an idea */
    router.get('/idea=:id', isAuthenticated, function(req, res) {
        res.render('idea');
    });

    /* GET an idea given an id  */
    router.get('/idea', isAuthenticated, function(req, res) {
        var id = req.query.id;

        startup.getIdea(id, function(idea_result) {
            if (idea_result.success) {
                startup.getPreference(id, function(pref_result){
                    if (pref_result.success) {
                        res.send({user: req.user, 
                            idea: idea_result.idea,
                            preference: pref_result.preference});
                    }
                });
            }            
        });
    })

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

    /* Handle update idea PUT */
    router.put('/idea=:id/update', function(req,res) {
        var id = req.params.id;

        title = req.query.title;
        description = req.query.description;
        industry = req.query.industry;

        startup.updateIdea(id, title, description, industry, function(result) {
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
    router.get('/idea=:id/delete', isAuthenticated, function(req, res) {
        var id = req.params.id;
        startup.deleteIdea(id, function(result) {
            if (result.success) {
                res.redirect('/home');
            }
        });
    });

    /* GET idea like */
    router.get('/idea=:id/like', isAuthenticated, function(req, res) {
        var id = req.params.id;
        startup.addPreference(id, req.user.username, 1, function(result) {
            if (result.success) {
                res.redirect('/idea=' + id);
            } else {
                req.flash('idea-like-err', result.errmsg);
                res.redirect('/idea=' + id);
            }
        });
    });

    /* GET idea dislike */
    router.get('/idea=:id/dislike', isAuthenticated, function(req, res) {
        var id = req.params.id;
        startup.addPreference(id, req.user.username, -1, function(result) {
            if (result.success) {
                res.redirect('/idea=' + id);
            } else {
                req.flash('idea-like-err', result.errmsg);
                res.redirect('/idea=' + id);
            }
        });
    });
    
    return router;
}
