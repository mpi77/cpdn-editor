'use strict';

angular.module('cpdnEditor.home', ['ngRoute'])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'components/home/home.html',
    controller: 'HomeCtrl'
  });
  
}])

.controller('HomeCtrl', ['$scope','Auth','Flash', function($scope, Auth, Flash) {
    $scope.isAuth = Auth.isAuth();
}]);
