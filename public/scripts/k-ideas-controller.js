var app = angular.module('startUp', []);

app.controller('KIdeasCtrl', function($scope, $http) {
    $scope.errmsg = '';


    $scope.findIdeas = function() {
        var k = parseInt($scope.value, 10);
        
        // form validation
        if (!$scope.value || !$scope.startdate || !$scope.enddate)
            $scope.errmsg = 'Fill out all fields';
        else if (!k && k != 0)
            $scope.errmsg = 'k must be a number'
        else if (k <= 0)
            $scope.errmsg = 'k must be greater than 0'
        else if ($scope.enddate < $scope.startdate)
            $scope.errmsg = 'Starting date must be before ending date'
        else {
            $scope.errmsg = '';

            // get ideas
        }

    }

});
