'use strict';

angular.module('cpdnEditor.navbar', [])

.controller('NavbarCtrl', ['$scope','$location','Auth', function($scope,$location,Auth) {
    $scope.isActive = function (viewLocation) { 
        let path = $location.path();
        return (path.indexOf(viewLocation) >= 0);
    };
    
    $scope.isEnabled = function (elementLocation) { 
        if(Auth.isAuth()){
            /* authorized section */
            switch(elementLocation){
            	case '/home':
            	case '/elements':
            	case '/maps':
            	case '/permissions':
            	case '/calculations':
            	case '/users':
            	case '/schemes':
            	case '/logout':
            	    return true;
            	default:
            	    return false;
            }
        } else{
            /* unauthorized section */
            switch(elementLocation){
        	case '/home':
        	case '/login':
        	    return true;
        	default:
        	    return false;
            }
        }
    };
    
    $scope.isAuth = Auth.isAuth(); 
    $scope.user = (Auth.isAuth()) ? Auth.getUser() : null;
}]);
