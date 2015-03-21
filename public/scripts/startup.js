var app = angular.module('startUp', ['ui.bootstrap']);

/* Functions used across multiple controllers */

var industries = ['Health', 'Technology', 'Education', 'Finance', 'Travel'];

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
            $scope.keywords = idea.keywords;

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
function getPreferences(id, p, email, callback) {
    var likes = 0;
    var dislikes = 0;
    var g = false;
    var msg = '';

    for (var i = 0; i < p.length; i++) {
        if (p[i].idea == id) {
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

/* Convert an ISO date to a more readable format and for easy sorting */
function convertDate(date) {
    var d = new Date(date);

    return d.getFullYear() + "-" 
        + ("0" + (d.getMonth() + 1)).slice(-2) + "-" 
        + ("0" + d.getDate()).slice(-2) + " at "
        + ("0" + d.getHours()).slice(-2) + ":" 
        + ("0" + d.getMinutes()).slice(-2);
}
