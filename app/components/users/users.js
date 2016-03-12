'use strict';

const API_GW_URL = "https://api.cpdn.sd2.cz/v1/";

angular.module('cpdnEditor.users', ['ngRoute'])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/users', {
    templateUrl: 'components/users/users.html',
    controller: 'UsersCtrl'
  });
    
}])

.controller('UsersCtrl', ['$scope', '$window', '$location', '$http', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, Auth, Flash, Utils) {
    
    let pageSizes = [
        {label:"15", value:15},
        {label:"25", value:25},
        {label:"50", value:50},
        {label:"100", value:100},
        {label:"200", value:200},
        {label:"500", value:500}
    ];
    
    $scope.paginator = {
        size : pageSizes[0],
        page : 1,
        totalItems : 0,
        totalPages : 0,
        totalPagesArray : [],
        pageSizes : pageSizes
    };
    
    $scope.sort = {
        column : '',
        reverse: false
    };
        
    $scope.back = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $window.history.back();
    };
              
    $scope.refresh = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.fetchUsers();
    };
    
    $scope.setPage = function(page){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		if(page > $scope.paginator.page){
		    $scope.paginator.previousPage++;
		    $scope.paginator.nextPage++;
		} else{
		    $scope.paginator.previousPage--;
		    $scope.paginator.nextPage--;
		}
		
		$scope.paginator.page = (page > 1) ? page : 1;
		
		$scope.refresh();
    };
    
    $scope.fetchUsers = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.users = [];
		$scope.paginator.totalPagesArray = [];
		
        let profile = Auth.getUser();
        let url = API_GW_URL + "users?e=(user)&pageSize=" + $scope.paginator.size.value + "&pageNumber=" + $scope.paginator.page;
		$http.get(url).then((res) => {
		    // success
			if(res != null && res.data != null && res.status == 200){
	            for(var i = 0; i < res.data.items.length; i++){
	                $scope.users.push({
	                    id : res.data.items[i]._meta.id,
	                    nick : res.data.items[i].nick,
	                    contact : {
	                        firstname : res.data.items[i].contact.firstname,
	                        lastname : res.data.items[i].contact.surname,
	                        email : res.data.items[i].contact.email,
	                        phone : res.data.items[i].contact.phone
	                    }
	                });
	            }
	            $scope.paginator.totalItems = res.data.itemsTotal;
	            $scope.paginator.totalPages = res.data.pagesTotal;
	            for(var i = 0; i < $scope.paginator.totalPages; i++){
	                $scope.paginator.totalPagesArray.push(i + 1);
	            }
			} else if(res != null && res.status == 204){
			    Flash.create('info', '<strong>Notice!</strong> Not found any user.');
		        console.log('[NOTICE] Users/UsersCtrl.fetchUsers()/getUsers/success');
			} else{
			    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Users/UsersCtrl.fetchUsers()/getUsers/success');
			}
		}, (res) => {
		    // fail
		    $scope.schemes = [];
		    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Users/UsersCtrl.fetchUsers()/getUsers/fail');
		});
    };
    
    $scope.fetchUsers();
}]);
