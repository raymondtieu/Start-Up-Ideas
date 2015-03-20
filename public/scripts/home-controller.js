var app = angular.module('startUp', ['ui.bootstrap', 'chart.js']);

/* Controller for the home page */
app.controller('HomeCtrl', function($scope, $modal, $http) {
    $scope.ideas = [];
    $scope.user = null;

    // options for which ideas to display
    $scope.viewOptions = ['All', 'My Ideas', 'Best k Ideas', 'Graph'];
    $scope.viewOption = $scope.viewOptions[0];

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
                getPreferences($scope.ideas[i]._id, result.preferences, "",
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

                $scope.$broadcast("updateGraph", {idea: $result.idea});
            });
    }

    // load graph data when view is switched to graph
    $scope.showGraph = function() {
        if ($scope.viewOption == 'Graph')
            $scope.$root.$broadcast("loadGraph", {ideas: $scope.ideas});
    }
});
