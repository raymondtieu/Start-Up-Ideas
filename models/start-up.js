var models = require('../models/schema');

module.exports = {

    /* Save a new idea to the database */
    postIdea : function(req, callback) {
        var title = req.body.title;
        var description = req.body.description;
        var industry = req.body.industry;

        models.Idea.findOne({'title': title}, function(err, idea) {
            if (err) {
                console.log("Error in postIdea: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            // idea already exists with same title
            if (idea) {
                console.log("Idea already exists with title: " + title);
                
                callback({success: false, 
                    errmsg: "Another idea already exists with the same title"});

                return;
            } else {
                var newIdea = new models.Idea();

                newIdea.poster = req.user.username;
                newIdea.title = title;
                newIdea.description = description;
                newIdea.industry = industry;

                newIdea.save(function(err) {
                    if (err){
                        console.log('Error in saving new idea: ' + err);  
                        throw err;  
                    }
                    console.log('New idea posted succesfully');    
                    
                    callback({success: true, idea: newIdea});
                });
            }

        });
    },

    /* Return all ideas posted by the user given a username */
    getIdeasByUser : function(username, callback) {
        models.Idea.find({poster: username}, function(err, ideas) {
            if (err) {
                console.log("Error in getIdeasByUser: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            callback({success: true, ideas: ideas});
        });
    },

    /* Return all posted ideas */
    getAllIdeas : function(callback) {
        // sort ideas by their name
        models.Idea.find({}).sort({title: 'asc'}).exec(function(err, ideas) {
            if (err) {
                console.log("Error in getAllIdeas: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            callback({success: true, ideas: ideas});
        });
    },

    /* Return an idea given an id */
    getIdea : function(id, callback) {
        models.Idea.findById(id, function(err, idea) {
            if (err) {
                console.log("Error in getIdea: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            callback({success: true, idea: idea});
        });
    },

    updateIdea: function(id, body, callback) {
        models.Idea.findById(id, function(err, idea) {
            if (err) {
                console.log("Error in updateIdea: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            var title = body.title;
            var description = body.description;
            var industry = body.industry;

            console.log("Update idea is " + title + ", " + description + ", " + industry);

            models.Idea.findOne({'title': title}, function(err, eidea) {
                if (err) {
                    console.log("Error in updateIdea: " + err);
                    callback({success: false, errmsg: err});
                    return;
                }

                if (eidea) {
                    console.log("Idea already exists with title: " + title);
                
                    callback({success: false, 
                        errmsg: "Another idea already exists with the same title"});

                    return;
                }
            
                idea.title = title;
                idea.description = description;
                idea.industry = industry;

                idea.save(function(err) {
                    if (err){
                        console.log('Error in saving new idea: ' + err);  
                        throw err;  
                    }
                    console.log('Idea updated succesfully');    
                    
                    callback({success: true});
                });
            });
        });
    },

    deleteIdea: function(id, callback) {
        models.Idea.findByIdAndRemove(id, function(err) {
            if (err) {
                console.log("Error in deleteIdea: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            callback({success: true});
        });
    }
}





