var app = angular.module('startUp', ['ui.bootstrap']);

/* Controller for the home page */
app.controller('ListCtrl', function($scope, $modal, $http) {
    $scope.ideas = [];
    $scope.user = null;

    // default sorting values - show the newest ideas first
    $scope.orderByField = 'posted';
    $scope.sortReverse = true;

    // options for which ideas to display
    $scope.viewOptions = ['All', 'My Ideas', 'Best k Ideas', 'Graph'];
    $scope.viewOption = $scope.viewOptions[0];
    $scope.industryOptions = ['All'].concat(industries);
    $scope.industryOption = $scope.industryOptions[0];

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
                getPreferences($scope.ideas[i].title, result.preferences, "",
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
            });
    }

    // handle sorting of ideas by different values when clicked
    $scope.changeSort = function(value) {
        if (value == $scope.orderByField)
            $scope.sortReverse = !$scope.sortReverse;
        else
            if (value == 'likes' || value == 'dislikes' || value == 'posted')
                $scope.sortReverse = true;
            else 
                $scope.sortReverse = false;

        $scope.orderByField = value;
    }

    // custom filter function to handle ideas to be displayed
    $scope.myFilter = function(idea) {
        var filter = false;
        var industry = false;
        var keyword = false;

        // decide whether to display all ideas, or only the current user's
        if ($scope.viewOption == $scope.viewOptions[0])
            filter = true;
        else if ($scope.viewOption == $scope.viewOptions[1])
            filter = idea.email == $scope.user.email;
        else    // phase 2
            filter = true;

        // decide which ideas to display given an industry
        if ($scope.industryOption == $scope.industryOptions[0])
            industry = true;
        else
            industry = idea.industry == $scope.industryOption;

        // decide which ideas to display given keywords
        keywordRegex = new RegExp($scope.keywordSearch, "i");

        if (!$scope.keywordSearch)
            keyword = true;
        else if (idea.keywords.match(keywordRegex)) {
            keyword = true;
        }

        return filter && industry && keyword;
    }
});

