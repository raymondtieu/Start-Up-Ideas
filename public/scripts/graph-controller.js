var app = angular.module('startUp', ['chart.js']);

var industries = ['Health', 'Technology', 'Education', 'Finance', 'Travel'];

/* Controller for the graph */
app.controller('GraphCtrl', function($scope, $http) {
    $scope.labels = industries;
    $scope.series = ['Series A'];
    $scope.data = [[0, 0, 0, 0, 0]];
    $scope.ideas = [];

    // get a list of all ideas
    $http({
        url: '/all-ideas',
        method: "GET",
    }).success(function(result) {
        $scope.ideas = result.ideas;

        // populate data for graph
        for (var i = 0; i < $scope.ideas.length; i++) {
            for (var j = 0; j < $scope.labels.length; j++) {
                if ($scope.ideas[i].industry == $scope.labels[j]) {
                    $scope.data[0][j]++;
                    break;
                }
            }
        }
    });

});