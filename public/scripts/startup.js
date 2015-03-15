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
        $modal.open({
            templateUrl: 'newIdeaModal.jade',
            backdrop: true,
            windowClass: 'modal',
            controller: function($scope, $modalInstance, $log) {
                $scope.industries = ['Health', 'Technology', 'Education', 'Finance', 'Travel'];

                $scope.submit = function() {
                    if (!$scope.title || !$scope.description || !$scope.industry) {
                        $scope.errmsg = "Please fill out all fields"
                    } else {
                        $http({
                            url: '/new-idea',
                            method: "POST",
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
});



