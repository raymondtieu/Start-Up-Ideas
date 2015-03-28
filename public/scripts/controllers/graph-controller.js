var app = angular.module('startUp');

/* Controller for the graph */
app.controller('GraphCtrl', function($scope, $http) {
    $scope.labels = industries;
    $scope.series = ['Series A'];
    $scope.data = [[0, 0, 0, 0, 0]];

    // populate data for graph
    $scope.$on("loadGraph", function(event, args) {
        $scope.data = [[0, 0, 0, 0, 0]];
        for (var i = 0; i < args.ideas.length; i++) {
            for (var j = 0; j < $scope.labels.length; j++) {
                if (args.ideas[i].industry == $scope.labels[j]) {
                    $scope.data[0][j]++;
                    break;
                }
            }
        }
    });

    // update the graph when a new idea is submitted
    $scope.$on("updateGraph", function(event, args) {
        for (var j = 0; j < $scope.labels.length; j++) {
            if (args.idea.industry == $scope.labels[j]) {
                $scope.data[0][j]++;
                break;
            }
        }
    });
});
