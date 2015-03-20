var app = angular.module('startUp');

app.controller('TableCtrl', function($scope) {
    // default sorting values - show the newest ideas first
    $scope.orderByField = 'posted';
    $scope.sortReverse = true;

    $scope.industryOptions = ['All'].concat(industries);
    $scope.industryOption = $scope.industryOptions[0];

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

        var view = $scope.$parent.viewOption;
        var options = $scope.$parent.viewOptions;

        // decide whether to display all ideas, or only the current user's
        if (view == options[0])
            filter = true;
        else if (view == options[1])
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
