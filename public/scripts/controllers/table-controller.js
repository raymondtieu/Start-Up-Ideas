var app = angular.module('startUp');

app.controller('TableCtrl', function($scope) {
    // default sorting values - show the newest ideas first
    $scope.orderByField = 'posted';
    $scope.sortReverse = true;

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

        var industryOptions = $scope.$parent.industryOptions;
        var industryOption = $scope.$parent.industryOption;

        // display all ideas
        if (view == options[0])
            filter = true;
        // display only the current user's ideas
        else if (view == options[1])
            filter = idea.email == $scope.user.email;
        // prompt for a k and dates
        else if (view == options[2])
            filter = true;

        // decide which ideas to display given an industry
        if (industryOption == industryOptions[0])
            industry = true;
        else
            industry = idea.industry == industryOption;

        // decide which ideas to display given keywords
        keywordRegex = new RegExp($scope.$parent.keywordSearch, "i");

        if (!$scope.$parent.keywordSearch)
            keyword = true;
        else if (idea.keywords.match(keywordRegex)) {
            keyword = true;
        }

        return filter && industry && keyword;
    }
});
