var models = require('../models/schema');

module.exports = {

    /* Save a new idea to the database */
    postIdea : function(user, title, description, industry, keywords, callback) {
        models.Idea.findOne({'title': new RegExp('^' + title + '$', "i")}, function(err, idea) {
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

                newIdea.email = user.email;
                newIdea.poster = user.name;
                newIdea.title = title;
                newIdea.description = description;
                newIdea.industry = industry;
                newIdea.keywords = keywords;

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
    getIdeasByUser : function(user, callback) {
        models.Idea.find({email: user.email}, function(err, ideas) {
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
        models.Idea.find({}, function(err, ideas) {
            if (err) {
                console.log("Error in getAllIdeas: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            callback({success: true, ideas: ideas});
        });
    },

    /* Return an idea given an id */
    getIdea : function(user, id, callback) {
        models.Idea.findById(id, function(err, idea) {
            if (err) {
                console.log("Error in getIdea: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            callback({success: true, user: user, idea: idea});
        });
    },

    /* Update an existing idea given an id and new values */
    updateIdea: function(id, title, description, industry, keywords, callback) {
        models.Idea.findById(id, function(err, idea) {
            if (err) {
                console.log("Error in updateIdea: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            models.Idea.findOne({'title': new RegExp('^' + title + '$', "i")}, function(err, eidea) {
                if (err) {
                    console.log("Error in updateIdea: " + err);
                    callback({success: false, errmsg: err});
                    return;
                }
                
                if (eidea && idea.title != eidea.title) {
                    console.log("Idea already exists with title: " + title);
                
                    callback({success: false, 
                        errmsg: "Another idea already exists with the same title"});

                    return;
                }
            
                idea.title = title;
                idea.description = description;
                idea.industry = industry;
                idea.keywords = keywords;

                idea.save(function(err) {
                    if (err){
                        console.log('Error in saving new idea: ' + err);  
                        throw err;  
                    }
                    console.log('Idea updated succesfully');    
                    
                    callback({success: true, idea: idea});
                });
            });
        });
    },

    /* Delete an existing idea given an id */
    deleteIdea: function(id, callback) {
        models.Idea.findById(id, function(err, idea) {
            if (err) {
                console.log("Error in deleteIdea: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            // also delete all preferences about idea given by other users
            models.Preference.remove({title: idea.title}, function(err) {
                if (err) {
                    console.log("Error in deleteIdea: " + err);
                    callback({success: false, errmsg: err});
                    return;
                }

                models.Idea.findByIdAndRemove(id, function(err) {
                    if (err) {
                        console.log("Error in deleteIdea: " + err);
                        callback({success: false, errmsg: err});
                        return;
                    }

                    callback({success: true});
                });
            });
        });
    },


    /* Add a preference to an idea by a user given an id, a user and like/dislike */
    addPreference: function(id, email, p, callback) {
        models.Idea.findById(id, function(err, idea) {
            if (err) {
                console.log("Error in addPreference: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            if (idea) {
                models.Preference.findOne({title: idea.title, email: email})
                .exec(function(err, preference) {
                    if (err) {
                        console.log("Error in addPreference: " + err);
                        callback({success: false, errmsg: err});
                        return;
                    }

                    if (preference) {
                        console.log("Already gave a preference for this idea");
                        callback({success: false, 
                            errmsg: "User already gave a preference for this idea"});

                        return;
                    } else {
                        var newPref = new models.Preference();

                        newPref.email = email;
                        newPref.title = idea.title;
                        newPref.preference = p;

                        console.log(email, idea.title);

                        newPref.save(function(err) {
                            if (err){
                                console.log('Error in saving new preference: ' + err);  
                                throw err;  
                            }
                            console.log('New preference added succesfully');    
                            
                            callback({success: true, idea: newPref});
                        });
                    }
                });
            } else {
                callback({success: false, errmsg: "Idea does not exist"});
            }
        });
    },

    /* Get the preferences for an idea */
    getPreferences: function(title, callback) {
        models.Preference.find({title: title}, function(err, preferences) {
            if (err) {
                console.log("Error in getPreferences: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            callback({success: true, preferences: preferences});
        });
    }
}





