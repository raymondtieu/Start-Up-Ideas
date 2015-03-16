var app = angular.module('startUp', ['ui.bootstrap']);

app.controller('HomeCtrl', function($scope, $modal, $http) {
    $scope.ideas = [];
    $scope.errmsg = '';
    
    $http({
        url: '/my-ideas',
        method: "GET",
    }).success(function($result) {
        if ($result.success) {
            $scope.ideas = $result.ideas;
        }
    });

    var idea = {title: '', description: '', industry: 'Health', keywords: ''}

    $scope.open = function() {
        openModal($scope, $modal, $http, '/new-idea', idea, "POST", 
            function($result) {
                $scope.ideas.push($result.idea);
            });
    }
});

app.controller('IdeaCtrl', function($scope, $modal, $http) {
    $scope.idea = null;
    $scope.user = null;
    $scope.gave_preference = false;
    $scope.pref_msg = '';

    var id = window.location.href.split('=')[1];

    $http({
        url: '/idea',
        method: "GET",
        params: {id: id}
    }).success(function(result) {
        if (result.success) {
            $scope.idea = result.idea;
            $scope.user = result.user;

            // get all preferences for this idea
            $http({
                url: '/preferences',
                method: "GET",
                params: {title: $scope.idea.title}
            }).success(function(result) {
                if (result.success) {
                    getPreferences(result.preferences, $scope.user.email,
                        function(p) {
                            $scope.idea.likes = p.likes;
                            $scope.idea.dislikes = p.dislikes;
                            $scope.gave_preference = p.gave_preference;
                            $scope.pref_msg = p.msg;
                        });
                }
            });
        }

    });


    $scope.open = function() {
        openModal($scope, $modal, $http, window.location.href + '/update', 
            $scope.idea, "PUT", function($result) {
                $scope.idea = $result.idea;
            });
    }

    $scope.delete = function() {
        $http({
            url: '/idea=' + $scope.idea._id + '/delete',
            method: "DELETE"
        }).success(function(result) {
            console.log(result);
            window.location = '/home';
        })
    }

    $scope.like = function() {
        $http({
            url: '/idea=' + $scope.idea._id + '/like',
            method: "POST"
        }).success(function(result) {
            $scope.gave_preference = true;
            $scope.pref_msg = "You liked this idea"

            /* temporary */
            $scope.idea.like += 1;
        })
    }

    $scope.dislike = function() {
        $http({
            url: '/idea=' + $scope.idea._id + '/dislike',
            method: "POST"
        }).success(function(result) {
            $scope.gave_preference = true;
            $scope.pref_msg = "You disliked this idea"

            /* temporary */
            $scope.idea.dislike -= 1;
        })
    }
});

function openModal($scope, $modal, $http, url, idea, method, callback) {

    $modal.open({
        templateUrl: 'idea-modal.jade',
        backdrop: true,
        windowClass: 'modal',
        controller: function($scope, $modalInstance, $log) {
            $scope.industries = ['Health', 'Technology', 'Education', 'Finance', 'Travel'];
            $scope.title = idea.title;
            $scope.description = idea.description;
            $scope.industry = idea.industry;

            $scope.submit = function() {
                titleRegex = /^[a-zA-Z\ ]{5,30}$/;

                $title = trimInput($scope.title);

                $keywords = '';
                if ($scope.keywords)
                    $keywords = trimInput($scope.keywords);

                if (!($title.match(titleRegex))) {
                    $scope.errmsg = "Enter a title with only letter characters or spaces";
                } else if (!$scope.title || !$scope.description || !$scope.industry) {
                    $scope.errmsg = "Please fill out all fields";
                } else {
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

function trimInput(str) {
    var s = str.split(' ');
    var t = [];
    for (i = 0; i < s.length; i++) {
        if (s[i] != "")
            t.push(s[i]);
    }
    return t.join(' ');
}

function getPreferences(p, email, callback) {
    var likes = 0;
    var dislikes = 0;
    var g = false;
    var msg = '';

    for (var i = 0; i < p.length; i++) {
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

    callback({likes: likes, dislikes: dislikes, gave_preference: g, 
        msg: msg});
    return;
}

