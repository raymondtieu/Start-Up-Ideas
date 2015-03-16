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

    $scope.open = function() {
        openModal($scope, $modal, $http, '/new-idea', 
            {title: '', description: '', industry: 'Health'},
            "POST", function($result) {
                $scope.ideas.push($result.idea);
            });
    }
});

app.controller('IdeaCtrl', function($scope, $modal, $http) {
    $scope.idea = null;
    $scope.preference = 0;
    $scope.user = null;
    $scope.give_preference = false;
    $scope.pref_msg = '';

    var id = window.location.href.split('=')[1];

    $http({
        url: '/idea',
        method: "GET",
        params: {id: id}
    }).success(function(result) {
        $scope.idea = result.idea;
        $scope.preference = result.preference;
        $scope.user = result.user;

        $http({
            url: '/preference',
            method: "GET",
            params: {title: $scope.idea.title, username: $scope.user.username}
        }).success(function(result) {
            if (result.success) {
                console.log(result);
                $scope.give_preference = true;
            } else {
                if (result.preference.preference == 1) {
                    $scope.pref_msg = "You liked this idea"
                } else
                    $scope.pref_msg = "You disliked this idea"
            }
        });
    });


    $scope.open = function() {
        openModal($scope, $modal, $http, window.location.href + '/update', 
            $scope.idea, "PUT", function($result) {
                $scope.idea.title = $result.idea.title;
                $scope.idea.description = $result.idea.description;
                $scope.idea.industry = $result.idea.industry;
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
            $scope.give_preference = false;
            $scope.pref_msg = "You liked this idea"

            /* temporary */
            $scope.preference += 1;
        })
    }

    $scope.dislike = function() {
        $http({
            url: '/idea=' + $scope.idea._id + '/dislike',
            method: "POST"
        }).success(function(result) {
            $scope.give_preference = false;
            $scope.pref_msg = "You disliked this idea"

            /* temporary */
            $scope.preference -= 1;
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
                            industry: $scope.industry
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


