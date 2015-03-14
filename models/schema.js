var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {type: String, required: true, trim: true},
    email: {type: String, required: true, trim: true},
    password: {type: String, required: true}
});

var IdeaSchema = new Schema({
    poster: {type: String, required: true, trim: true},
    title: {type: String, required: true, trim: true},
    description: {type: String, required: true, trim: true},
    industry: {type: String, required: true, trim: true},
});

mongoose.model('User', UserSchema);
var User = mongoose.model('User');

mongoose.model('Idea', IdeaSchema);
var Idea = mongoose.model('Idea');


module.exports = {
    User: User,
    Idea: Idea
}