var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, trim: true},
    password: {type: String, required: true}
});

var IdeaSchema = new Schema({
    poster: {type: String, required: true, trim: true},
    title: {type: String, required: true, trim: true},
    description: {type: String, required: true, trim: true},
    industry: {type: String, required: true, trim: true},
    keywords: {type: String, trim: true},
    posted: {type: Date, required: true} 
});

var PreferenceSchema = new Schema({
    email: {type: String, required: true, trim: true},
    title: {type: String, required: true, trim: true},
    preference: {type: Number, required: true}
});

mongoose.model('User', UserSchema);
var User = mongoose.model('User');

mongoose.model('Idea', IdeaSchema);
var Idea = mongoose.model('Idea');

mongoose.model('Preference', PreferenceSchema);
var Preference = mongoose.model('Preference');

module.exports = {
    User: User,
    Idea: Idea,
    Preference: Preference
}