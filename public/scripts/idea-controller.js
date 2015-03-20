var app = angular.module('startUp', ['ui.bootstrap']);

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
            $scope.idea.posted = convertDate($scope.idea.posted);

            // get all preferences for this idea
            $http({
                url: '/preferences',
                method: "GET",
                params: {id: $scope.idea._id}
            }).success(function(result) {
                if (result.success) {
                    // set amount of likes/dislikes for this idea
                    // determine whether this user liked/disliked this idea
                    getPreferences($scope.idea._id, result.preferences, $scope.user.email,
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
                $scope.idea.title = $result.idea.title;
                $scope.idea.description = $result.idea.description;
                $scope.idea.industry = $result.idea.industry;
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

