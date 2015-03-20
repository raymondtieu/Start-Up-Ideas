var app = angular.module('startUp', []);

app.controller('BestIdeasCtrl', function($scope, $http) {
    $scope.errmsg = '';
    $scope.lim = 0;

    $scope.ideas = [];

    $scope.findIdeas = function() {
        var k = parseInt($scope.num, 10);
       
        // form validation
        if (!$scope.num || !$scope.startdate || !$scope.enddate)
            $scope.errmsg = 'Fill out all fields';
        else if (!k && k != 0)
            $scope.errmsg = 'k must be a number'
        else if (k <= 0)
            $scope.errmsg = 'k must be greater than 0'
        else if ($scope.enddate <= $scope.startdate)
            $scope.errmsg = 'Starting date must be before ending date'
        else {
            $scope.errmsg = '';

            // get all ideas between the start and end dates
            $http({
                url: '/get-ideas-between',
                method: "GET",
                params: {k: k, start: $scope.startdate, end: $scope.enddate}
            }).success(function(result) {
                $scope.ideas = result.ideas;

                // for each idea, get the sum of all preferences
                for (var i = 0; i < $scope.ideas.length; i++) {
                    (function(j) {
                        $http({
                            url: '/get-overall',
                            method: "GET",
                            params: {id: $scope.ideas[i]._id}
                        }).success(function(result){
                            if (result.overall.length == 0)
                                $scope.ideas[j].preference = 0;
                            else
                                $scope.ideas[j].preference = result.overall[0].overall;

                            $scope.lim = k;
                        });
                    } (i));
                }
            });
        }
    }
});
