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
            "POST");
    }
});

app.controller('IdeaCtrl', function($scope, $modal, $http) {
    $scope.idea = null;
    $scope.preference = 0;
    $scope.user = null;

    var id = window.location.href.split('=')[1];

    $http({
        url: '/idea',
        method: "GET",
        params: {id: id}
    }).success(function(result) {
        $scope.idea = result.idea;
        $scope.preference = result.preference;
        $scope.user = result.user;
    });

    $scope.open = function() {
        openModal($scope, $modal, $http, window.location.href + '/update', 
            $scope.idea, "PUT");
    }

    $scope.delete = function() {
        $http({
            url: ''
        })
    }
});

function openModal($scope, $modal, $http, url, idea, method) {

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
            if (!$scope.title || !$scope.description || !$scope.industry) {
                $scope.errmsg = "Please fill out all fields"
            } else {
                $http({
                    url: url,
                    method: method,
                    params: {title: $scope.title,
                        description: $scope.description,
                        industry: $scope.industry
                    }
                }).success(function($result) {
                    if ($result.success) {
                        console.log($result);
                        $modalInstance.dismiss('cancel');
                        window.location.reload();
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



