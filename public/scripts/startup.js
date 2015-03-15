var app = angular.module('startUp', ['ui.bootstrap']);

app.controller('NewIdeaCtrl', function($scope, $modal, $http) {
    $scope.errmsg = '';

    $scope.open = function() {
        $modal.open({
            templateUrl: 'newIdeaModal.jade',
            backdrop: true,
            windowClass: 'modal',
            controller: function($scope, $modalInstance, $log) {
                $scope.newIdea = function() {
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
                        } else {
                            $scope.errmsg = $result.errmsg;
                        }
                    });
                }

                $scope.cancel = function() {
                    $modalInstance.dismiss('cancel');
                }
            }
        });
    }
});