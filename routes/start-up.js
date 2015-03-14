var models = require('../models/schema');

module.exports = {
    postIdea : function(req, callback) {
        var title = req.body.title;
        var description = req.body.description;
        var industry = req.body.industry;

        console.log("New idea is " + title + ", " + description + ", " + industry);

        models.Idea.findOne({'title': title}, function(err, idea) {
            if (err) {
                console.log("Error in postIdea: " + err);
                callback({success: false, errmsg: err});
                return;
            }

            // idea already exists with same title
            if (idea) {
                console.log("Idea already exists with title: " + title);
                req.flash({'message': "Another idea exists with the same title"});

                callback({success: false, errmsg: "Idea already exists"});
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
                    console.log('New Idea posted succesfulyl');    
                    
                    callback({success: true, idea: newIdea});
                });
            }

        });
    }
}