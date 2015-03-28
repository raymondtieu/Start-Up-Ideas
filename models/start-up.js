var models = require('../models/schema');

var mongoose = require('mongoose');

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
            models.Preference.remove({idea: idea._id}, function(err) {
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
                models.Preference.findOne({idea: idea._id, email: email})
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
                        newPref.idea = idea._id;
                        newPref.preference = p;

                        newPref.save(function(err) {
                            if (err){
                                console.log('Error in saving new preference: ' + err);  
                                throw err;  
                            }
                            console.log('New preference added succesfully');    
                            
                            callback({success: true, pref: newPref});
                        });
                    }
                });
            } else {
                callback({success: false, errmsg: "Idea does not exist"});
            }
        });
    },

    /* Get the preferences for an idea */
    getPreferences: function(id, callback) {
        console.log(id);

        models.Preference.find({idea: id}, function(err, preferences) {
            if (err) {
                console.log("Error in getPreferences: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            callback({success: true, preferences: preferences});
        });
    },

    /* Get all preferences for all ideas */
    getAllPreferences: function(callback) {
        models.Preference.find({}, function(err, preferences) {
            if (err) {
                console.log("Error in getAllPreferences: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            callback({success: true, preferences: preferences});
        });
    },

    /* Get ideas between the start and end dates */
    getIdeasBetween: function(k, start, end, callback) {
        // add 4 hours to compensate for UTC times
        start = new Date(start);
        start.setHours(start.getHours() + 4);

        // set the ending date to the end of that day
        end = new Date(end);
        end.setHours(end.getHours() + 27);
        end.setMinutes(59);
        end.setSeconds(59);

        start = start.toISOString();
        end = end.toISOString();        

        models.Idea.find({posted: {$gte: start, $lt: end}})
            .exec(function (err, ideas) {
                if (err) {
                    console.log("Error in getIdeasBetween: " + err);
                    callback({success: false, errmsg: err});
                    return;
                }

               callback({success: true, ideas: ideas});

            });
    },


    /* Get overall preference for an idea given a title */
    getOverall: function(id, callback) {
        id = new mongoose.Types.ObjectId(id);

        models.Preference.aggregate([
            {$match: {idea: id}},
            {$group: {
                _id: "$idea",
                overall: {$sum: "$preference"}
            }}
        ]).exec(function(err, preference) {
            if (err) {
                console.log("Error in getOverall: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            callback({success:true, overall: preference});
        });
    }
}





