'use strict';

const API_GW_URL = "https://api.cpdn.sd2.cz/v1/";
const PERMISSION_FROM_INTERVAL = 1000 * 60;
const PERMISSION_TO_INTERVAL = 1000 * 3600 * 24 * 365;
const PERMISSION_INITIAL_MODE = "rwx";

angular.module('cpdnEditor.schemes', ['ngRoute'])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/schemes', {
    templateUrl: 'components/schemes/schemes.html',
    controller: 'SchemesCtrl'
  });
  
  $routeProvider.when('/schemes/:schemeId', {
    templateUrl: 'components/schemes/scheme.html',
    controller: 'SchemeCtrl'
  });
    
}])

.controller('SchemesCtrl', ['$scope', '$window', '$location', '$http', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, Auth, Flash, Utils) {
    
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
    
    $scope.create = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$location.path('/schemes/new');
    };
    
    $scope.edit = function(schemeId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$location.path('/schemes/' + schemeId);
    };
    
    $scope.openSchematicMap = function(schemeId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$location.path('/maps/schematic/' + schemeId);
    };
    
    $scope.openPermissions = function(schemeId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$location.path('/permissions/' + schemeId);
    };
    
    $scope.delete = function(schemeId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$http.delete(API_GW_URL + "schemes/" + schemeId).then((res) => {
		    // success
			if(res.status == 200){
				Flash.create('success', '<strong>Well done!</strong> You successfully removed scheme.');
			} else{
				Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				console.log('[FAIL] Scheme/SchemesCtrl.delete()/deleteScheme/success');
			}
			$location.path('/schemes');
			$scope.fetchSchemes();
		}, (res) => {
		    // fail
		    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Scheme/SchemesCtrl.delete()/deleteScheme/fail');
		});
    };
    
    $scope.refresh = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.fetchSchemes();
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
    
    $scope.fetchSchemes = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.schemes = [];
		$scope.paginator.totalPagesArray = [];
		
        let profile = Auth.getUser();
        let url = API_GW_URL + "permissions?q=(profileId=" + profile.id + ")&e=(permission,permission.scheme)&pageSize=" + $scope.paginator.size.value + "&pageNumber=" + $scope.paginator.page;
		$http.get(url).then((res) => {
		    // success
			if(res != null && res.data != null && res.status == 200){
	            for(var i = 0; i < res.data.items.length; i++){
	                let from = Utils.mysqlTimeStampToDate(res.data.items[i].tsFrom),
	                    to = Utils.mysqlTimeStampToDate(res.data.items[i].tsTo),
	                    isReadable = /r/.test(res.data.items[i].mode);
	                if(from <= Date.now() && to > Date.now() && isReadable){
	                    $scope.schemes.push({
	                        id : res.data.items[i].scheme._meta.id,
	                        name : res.data.items[i].scheme.name,
	                        description : res.data.items[i].scheme.description,
	                        version : res.data.items[i].scheme.version,
	                        lock : res.data.items[i].scheme.lock,
	                        mode : res.data.items[i].mode,
	                        tsFrom : from,
	                        tsTo : to,
	                        isReadable : isReadable,
	                        isWritable : /w/.test(res.data.items[i].mode)
	                    });
	                }
	            }
	            $scope.paginator.totalItems = res.data.itemsTotal;
	            $scope.paginator.totalPages = res.data.pagesTotal;
	            for(var i = 0; i < $scope.paginator.totalPages; i++){
	                $scope.paginator.totalPagesArray.push(i + 1);
	            }
			} else if(res != null && res.status == 204){
			    Flash.create('info', '<strong>Notice!</strong> Not found any scheme.');
		        console.log('[NOTICE] Schemes/SchemesCtrl.fetchSchemes()/getScheme/success');
			} else{
			    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Schemes/SchemesCtrl.fetchSchemes()/getScheme/success');
			}
		}, (res) => {
		    // fail
		    $scope.schemes = [];
		    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Maps/SelectSchemeCtrl.fetchSchemes()/getScheme/fail');
		});
    };
    
    $scope.fetchSchemes();
}])

.controller('SchemeCtrl', ['$scope', '$window', '$location', '$http', '$routeParams','Auth','Flash', 'Utils', function($scope, $window, $location, $http, $routeParams, Auth, Flash, Utils) {
    
    $scope.locks = [
        {id:0, title:"unlocked"},
        {id:1, title:"locked"}
    ];
    
    $scope.back = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $window.history.back();
    };
    
    $scope.cancel = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $location.path('/schemes');
    };
    
    $scope.run = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.schemes = [];
		
        let schemeId = $routeParams.schemeId;
        if(parseInt(schemeId) > 0){
            $scope.schemeBoxTitle = schemeId;
            $scope.userBoxTitle = "Update values of the scheme.";
            let profile = Auth.getUser();
            let urlCheckPermission = API_GW_URL + "permissions?q=(profileId=" + profile.id + ";schemeId="+schemeId+")&e=(permission)&pageSize=10";
		    $http.get(urlCheckPermission).then((res) => {
		        // success
			    if(res != null && res.data != null && res.status == 200){
	                let hasPermission = false;
	                for(var i = 0; i < res.data.items.length; i++){
	                    let from = Utils.mysqlTimeStampToDate(res.data.items[i].tsFrom),
	                        to = Utils.mysqlTimeStampToDate(res.data.items[i].tsTo),
	                        now = Date.now(),
	                        isReadable = /r/.test(res.data.items[i].mode),
	                        isWritable = /w/.test(res.data.items[i].mode);
	                    if(from <= now && to > now && isReadable && isWritable){
	                        hasPermission = true;
	                        break;
	                    }
	                }
	                
	                if(hasPermission){
		                $http.get(API_GW_URL + "schemes/" + schemeId).then((res) => {
		                    // success
			                if(res != null && res.data != null && res.status == 200){
	                            $scope.scheme = {
                                    name : res.data.name,
                                    description : res.data.description,
                                    version : parseInt(res.data.version),
                                    lock : (parseInt(res.data.lock) == 1) ? true : false
                                };
			                }  else{
			                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Scheme/SchemeCtrl.run()/geScheme/success');
			                }
		                }, (res) => {
		                    // fail
		                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                    console.log('[FAIL] Scheme/SchemeCtrl.run()/geScheme/fail');
		                });
	                } else{
	                    Flash.create('info', '<strong>Notice!</strong> You don\'t have RW permission to access this scheme.');
		                console.log('[NOTICE] Scheme/SchemeCtrl.run()/getPermission/success');
		                $location.path('/schemes');
	                }
			    } else if(res != null && res.status == 204){
			        Flash.create('info', '<strong>Notice!</strong> You don\'t have RW permission to access this scheme.');
		            console.log('[NOTICE] Scheme/SchemeCtrl.run()/getPermission/success');
		            $location.path('/schemes');
			    } else{
			        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Scheme/SchemeCtrl.run()/getPermission/success');
		            $location.path('/schemes');
			    }
		    }, (res) => {
		        // fail
		        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Scheme/SchemeCtrl.run()/getPermission/fail');
		        $location.path('/schemes');
		    });
        } else {
            $scope.schemeBoxTitle = "new";
            $scope.userBoxTitle = "Fill values of a new scheme.";
            $scope.scheme = {
                name : "",
                description : "",
                version : 1,
                lock : false
            };
        }
    };
    
    $scope.submit = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		if ($scope.schemeForm.$valid){
            let schemeId = $routeParams.schemeId,
                url = API_GW_URL + "schemes/",
                profile = Auth.getUser();
            if(parseInt(schemeId) > 0){
                url = url + schemeId + "/";
            } 
            
            $scope.scheme.lock = ($scope.scheme.lock) ? 1 : 0;
            
            $http.post(url, JSON.stringify($scope.scheme)).then((res) => {
		        // success
			    if(schemeId == "new" && res.status == 201){
			        Flash.create('success', '<strong>Well done!</strong> You successfully created new scheme.');
			        schemeId = res.data.id;
			        
			        // add permission to me
			        $http.post(API_GW_URL + "permissions/", JSON.stringify({
			                user : profile.id,
			                scheme : schemeId,
			                mode : PERMISSION_INITIAL_MODE,
			                tsFrom : Utils.getMysqlTimeStamp(new Date((new Date()).getTime() - PERMISSION_FROM_INTERVAL)),
			                tsTo : Utils.getMysqlTimeStamp(new Date((new Date()).getTime() + PERMISSION_TO_INTERVAL))
			        })).then((res) => {
		                // success
		                $scope.scheme = {};
			            if(res.status == 201){
			                $location.path('/schemes');
			            } else {
				            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				            console.log('[FAIL] Scheme/SchemeCtrl.submit()/postPermission/success');
			            }
		            }, (res) => {
		                // fail
		                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                console.log('[FAIL] Scheme/SchemeCtrl.submit()/postPermission/fail');
		            });
			    } else if(parseInt(schemeId) > 0 && res.status == 200){
			        Flash.create('success', '<strong>Well done!</strong> You successfully updated your scheme.');
			        $location.path('/schemes');
			    } else {
				    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				    console.log('[FAIL] Scheme/SchemeCtrl.submit()/postScheme/success');
			    }
		    }, (res) => {
		        // fail
		        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Scheme/SchemeCtrl.submit()/postScheme/fail');
		    });
        }
    };
    
    $scope.run();
}]);
