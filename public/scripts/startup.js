var app = angular.module('startUp', ['ui.bootstrap']);

var industries = ['Health', 'Technology', 'Education', 'Finance', 'Travel'];

/* Controller for a single idea */
app.controller('IdeaCtrl', function($scope, $modal, $http) {
    $scope.idea = null;
    $scope.user = null;
    $scope.gave_preference = false;
    $scope.pref_msg = '';

    var id = window.location.href.split('=')[1];

    // get current user
    getUser($http, function(result) {
        $scope.user = result;
    });

    // get details about this idea
    $http({
        url: '/idea',
        method: "GET",
        params: {id: id}
    }).success(function(result) {
        if (result.success) {
            $scope.idea = result.idea;

            // get all preferences for this idea
            $http({
                url: '/preferences',
                method: "GET",
                params: {title: $scope.idea.title}
            }).success(function(result) {
                if (result.success) {
                    // set amount of likes/dislikes for this idea
                    // determine whether this user liked/disliked this idea
                    getPreferences($scope.idea.title, result.preferences, $scope.user.email,
                        function(result) {
                            $scope.idea.likes = result.likes;
                            $scope.idea.dislikes = result.dislikes;
                            $scope.gave_preference = result.gave_preference;
                            $scope.pref_msg = result.msg;
                        });
                }
            });
        }
    });

    // open modal when user wants to update this idea
    $scope.open = function() {
        openModal($scope, $modal, $http, window.location.href + '/update', 
            $scope.idea, "PUT", function($result) {
                $scope.idea = $result.idea;
            });
    }

    // redirect back home when user wants to delete this idea
    $scope.delete = function() {
        $http({
            url: '/idea=' + $scope.idea._id + '/delete',
            method: "DELETE"
        }).success(function(result) {
            console.log(result);
            window.location = '/home';
        })
    }

    // update this user's preference about this idea
    $scope.like = function() {
        $http({
            url: '/idea=' + $scope.idea._id + '/like',
            method: "POST"
        }).success(function(result) {
            $scope.gave_preference = true;
            $scope.pref_msg = "You liked this idea"

            /* temporary */
            $scope.idea.likes += 1;
        })
    }

    // update this user's preference about this idea
    $scope.dislike = function() {
        $http({
            url: '/idea=' + $scope.idea._id + '/dislike',
            method: "POST"
        }).success(function(result) {
            $scope.gave_preference = true;
            $scope.pref_msg = "You disliked this idea"

            /* temporary */
            $scope.idea.dislikes -= 1;
        })
    }
});


/* Controller for the home page */
app.controller('ListCtrl', function($scope, $modal, $http) {
    $scope.ideas = [];
    $scope.user = null;

    // default sorting values - show the newest ideas first
    $scope.orderByField = 'posted';
    $scope.sortReverse = true;

    // options for which ideas to display
    $scope.viewOptions = ['All', 'My Ideas', 'Best k Ideas', 'Graph'];
    $scope.viewOption = $scope.viewOptions[0];
    $scope.industryOptions = ['All'].concat(industries);
    $scope.industryOption = $scope.industryOptions[0];

    // get current user
    getUser($http, function(result) {
        $scope.user = result;
    });

    // get a list of all ideas
    $http({
        url: '/all-ideas',
        method: "GET",
    }).success(function(result) {
        $scope.ideas = result.ideas;

        // calculate how many likes/dislikes each idea has
        $http({
            url: '/all-preferences',
            method: "GET"
        }).success(function(result) {
            for (var i = 0; i < $scope.ideas.length; i++) {
                getPreferences($scope.ideas[i].title, result.preferences, "",
                    function(result) {
                        $scope.ideas[i].likes = result.likes
                        $scope.ideas[i].dislikes = result.dislikes
                        $scope.ideas[i].posted = convertDate($scope.ideas[i].posted);
                    });
            }
        });
    });


    // default values for new idea form
    var idea = {title: '', description: '', industry: industries[0], keywords: ''};

    // open modal when user wants to submit a new idea
    $scope.open = function() {
        openModal($scope, $modal, $http, '/new-idea', idea, "POST", 
            function($result) {
                $result.idea.likes = 0;
                $result.idea.dislikes = 0;
                $scope.ideas.push($result.idea);
            });
    }

    // handle sorting of ideas by different values when clicked
    $scope.changeSort = function(value) {
        if (value == $scope.orderByField)
            $scope.sortReverse = !$scope.sortReverse;
        else
            if (value == 'likes' || value == 'dislikes' || value == 'posted')
                $scope.sortReverse = true;
            else 
                $scope.sortReverse = false;

        $scope.orderByField = value;
    }

    // custom filter function to handle ideas to be displayed
    $scope.myFilter = function(idea) {
        var filter = false;
        var industry = false;
        var keyword = false;

        // decide whether to display all ideas, or only the current user's
        if ($scope.viewOption == $scope.viewOptions[0])
            filter = true;
        else if ($scope.viewOption == $scope.viewOptions[1])
            filter = idea.email == $scope.user.email;
        
        else    // phase 2
            filter = true;

        // decide which ideas to display given an industry
        if ($scope.industryOption == $scope.industryOptions[0])
            industry = true;
        else
            industry = idea.industry == $scope.industryOption;

        // decide which ideas to display given keywords
        keywordRegex = new RegExp($scope.keywordSearch, "i");

        if (!$scope.keywordSearch)
            keyword = true;
        else if (idea.keywords.match(keywordRegex)) {
            keyword = true;
        }

        return filter && industry && keyword;
    }
});


/* Open a modal to handle a new or updating an idea */
function openModal($scope, $modal, $http, url, idea, method, callback) {
    $modal.open({
        templateUrl: 'idea-modal.jade',
        backdrop: true,
        windowClass: 'modal',
        controller: function($scope, $modalInstance, $log) {
            // available industries to choose from 
            $scope.industries = industries;
            $scope.title = idea.title;
            $scope.description = idea.description;
            $scope.industry = idea.industry;

            $scope.submit = function() {

                // client-side form validation
                titleRegex = /^[a-zA-Z\ ]{5,30}$/;
                $title = trimInput($scope.title);

                $keywords = '';
                if ($scope.keywords)
                    $keywords = trimInput($scope.keywords);

                if (!($title.match(titleRegex))) {
                    $scope.errmsg = "Invalid title. 5-30 letter characters only.";
                } else if (!$scope.title || !$scope.description || !$scope.industry) {
                    $scope.errmsg = "Please fill out all fields";
                } else {
                    // send HTTP request if form passes server side validation
                    $http({
                        url: url,
                        method: method,
                        params: {title: $title,
                            description: $scope.description,
                            industry: $scope.industry,
                            keywords: $keywords
                        }
                    }).success(function($result) {
                        if ($result.success) {
                            console.log($result);
                            $result.idea.posted = convertDate($result.idea.posted);
                            $modalInstance.dismiss('cancel');
                            callback($result);
                        } else {
                            $scope.errmsg = $result.errmsg;
                        }
                    });
                }
            }

            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            }
        }
    });
}


/* Get the current user */
function getUser($http, callback) {
    $http({
        url: '/user',
        method: "GET",
    }).success(function(result) {
        callback(result.user);
    });
}

/* Trim and replace all whitespace inbetween characters with a single 
   whitespace character given a string */
function trimInput(str) {
    var s = str.split(' ');
    var t = [];
    for (i = 0; i < s.length; i++) {
        if (s[i] != "")
            t.push(s[i]);
    }
    return t.join(' ');
}


/* Calculate likes and dislikes given a list of preferences */
function getPreferences(title, p, email, callback) {
    var likes = 0;
    var dislikes = 0;
    var g = false;
    var msg = '';

    for (var i = 0; i < p.length; i++) {
        if (p[i].title == title) {
            if (p[i].email == email) {
                g = true;

                if (p[i].preference == 1)
                    msg = "You liked this idea";
                else
                    msg = "You disliked this idea";
            }

            if (p[i].preference == 1)
                likes++;
            else
                dislikes++;
        }
    }

    callback({likes: likes, dislikes: dislikes, gave_preference: g, 
        msg: msg});
    return;
}

/* Convert an ISO date to a more readable format */
function convertDate(date) {
    var d = new Date(date);
    return d.toString();
}

