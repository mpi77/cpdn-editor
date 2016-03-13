'use strict';

const API_GW_URL = "https://api.cpdn.sd2.cz/v1/";
const PERMISSION_TO_INTERVAL = 1000 * 3600 * 24 * 365;

angular.module('cpdnEditor.permissions', ['ngRoute'])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/permissions/scheme', {
    templateUrl: 'components/permissions/select-scheme.html',
    controller: 'PermissionsSelectSchemeCtrl'
  });
    
  $routeProvider.when('/permissions/:schemeId', {
    templateUrl: 'components/permissions/permissions.html',
    controller: 'PermissionsCtrl'
  });
  
  $routeProvider.when('/permissions/:schemeId/p/:permissionId', {
    templateUrl: 'components/permissions/permission.html',
    controller: 'PermissionCtrl'
  });
  
}])

.controller('PermissionsSelectSchemeCtrl', ['$scope', '$http', '$window', '$location', 'Auth', 'Utils', 'Flash', function($scope, $http, $window, $location, Auth, Utils, Flash) {
    $scope.go = function(type){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		if($scope.selectedScheme && $scope.selectedScheme.id > 0 && (type == "permissions")){
		    $location.path('/permissions/' + $scope.selectedScheme.id );
		}
    };
    
    $scope.back = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $window.history.back();
    };
    
    $scope.fetchSchemes = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.schemes = [];
		
        let profile = Auth.getUser();
        let url = API_GW_URL + "permissions?q=(profileId=" + profile.id + ")&e=(permission,permission.scheme)&pageSize=1000";
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
	                        name : res.data.items[i].scheme.name
	                    });
	                }
	            }
			} else if(res != null && res.status == 204){
			    Flash.create('info', '<strong>Notice!</strong> Not found any scheme.');
		        console.log('[NOTICE] Permissions/PermissionsSelectSchemeCtrl.fetchSchemes()/getScheme/success');
			} else{
			    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Permissions/PermissionsSelectSchemeCtrl.fetchSchemes()/getScheme/success');
			}
		}, (res) => {
		    // fail
		    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Permissions/PermissionsSelectSchemeCtrl.fetchSchemes()/getScheme/fail');
		});
    };
    
    $scope.fetchSchemes();
  
}])

.controller('PermissionsCtrl', ['$scope', '$window', '$location', '$http', '$routeParams', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, $routeParams, Auth, Flash, Utils) {
    
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
    
    $scope.config = {
        showSchemeInfo : false
    };
    
    $scope.showSchemeInfo = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $scope.config.showSchemeInfo = !$scope.config.showSchemeInfo;
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
		
		$location.path('/permissions/' + $routeParams.schemeId + '/p/' + 'new');
    };
    
    $scope.edit = function(permissionId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$location.path('/permissions/' + $routeParams.schemeId + '/p/' + permissionId);
    };
    
    $scope.delete = function(schemeId, permissionId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        let urlHasAnyPermission = API_GW_URL + "permissions?q=(schemeId="+schemeId+")&pageSize=10";
		$http.get(urlHasAnyPermission).then((res) => {
		    // success
		    if(res != null && res.status == 200 && res.data != null){
	            if(res.data.items != null && res.data.items.length > 1){
	                $http.delete(API_GW_URL + "permissions/" + permissionId).then((res) => {
		                // success
			            if(res.status == 200){
				            Flash.create('success', '<strong>Well done!</strong> You successfully removed permission.');
			            } else{
				            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				            console.log('[FAIL] Permissions/PermissionsCtrl.delete()/deletePermission/success');
			            }
			            $location.path('/permissions/' + schemeId );
			            $scope.refresh();
		            }, (res) => {
		                // fail
		                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                console.log('[FAIL] Permissions/PermissionsCtrl.delete()/deletePermission/fail');
		            });         
		        } else{
		            Flash.create('info', '<strong>Notice!</strong> You can\'t remove last permission from this scheme.');
		            console.log('[NOTICE] Permissions/PermissionsCtrl.delete()/foundPermission/success');
		        }
			} else if(res != null && res.status == 204){
			    Flash.create('info', '<strong>Notice!</strong> You can\'t remove last permission from this scheme.');
		        console.log('[NOTICE] Permissions/PermissionsCtrl.delete()/getAnyPermission/success');
			} else{
			    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Permissions/PermissionsCtrl.delete()/getAnyPermission/success');
			}
	    }, (res) => {
		    // fail
		    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Permissions/PermissionsCtrl.delete()/getAnyPermission/fail');
		});
    };
    
    $scope.refresh = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.fetchPermissions();
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
    
    $scope.fetchPermissions = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.permissions = [];
		$scope.paginator.totalPagesArray = [];
		
        let schemeId = $routeParams.schemeId;
        if(parseInt(schemeId) > 0){
            let profile = Auth.getUser();
            let urlCheckPermission = API_GW_URL + "permissions?q=(profileId=" + profile.id + ";schemeId="+schemeId+")&e=(permission,permission.scheme)&pageSize=10";
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
	                    if(from <= now && to > now && isReadable){
	                        $scope.scheme = {
	                            id : res.data.items[i].scheme._meta.id,
                                name : res.data.items[i].scheme.name,
                                description : res.data.items[i].scheme.description,
                                version : parseInt(res.data.items[i].scheme.version),
                                lock : (parseInt(res.data.items[i].scheme.lock) == 1) ? true : false,
                                isWritable : isWritable
                            };
	                        hasPermission = true;
	                        break;
	                    }
	                }
	                
	                if(hasPermission){
		                
		                let urlPermissions = API_GW_URL + "permissions/?q=(schemeId=" + schemeId + ")&e=(permission,permission.scheme,permission.user)&s=(tsTo:desc)&pageSize=" + $scope.paginator.size.value + "&pageNumber=" + $scope.paginator.page;
		                $http.get(urlPermissions).then((res) => {
		                    // success
			                if(res != null && res.data != null && res.status == 200){
	                            for(var i = 0; i < res.data.items.length; i++){
	                                $scope.permissions.push({
	                                    id : res.data.items[i]._meta.id,
	                                    user : res.data.items[i].user.nick,
	                                    mode : res.data.items[i].mode,
	                                    tsFrom : res.data.items[i].tsFrom,
	                                    tsTo : res.data.items[i].tsTo,
	                                    isReadable : /r/.test(res.data.items[i].mode),
	                                    isWritable : /w/.test(res.data.items[i].mode),
	                                    isExecutable : /x/.test(res.data.items[i].mode)
	                                });
	                            }
	                            $scope.paginator.totalItems = res.data.itemsTotal;
	                            $scope.paginator.totalPages = res.data.pagesTotal;
	                            for(var i = 0; i < $scope.paginator.totalPages; i++){
	                                $scope.paginator.totalPagesArray.push(i + 1);
	                            }
			                } else if(res != null && res.status == 204){
			                    Flash.create('info', '<strong>Notice!</strong> Not found any permission.');
		                        console.log('[NOTICE] Permissions/PermissionsCtrl.fetchPermissions()/getSchemePermissions/success');
			                } else{
			                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Permissions/PermissionsCtrl.fetchPermissions()/getSchemePermissions/success');
		                        $location.path('/permissions/scheme');
			                }
		                }, (res) => {
		                    // fail
		                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                    console.log('[FAIL] Permissions/PermissionsCtrl.fetchPermissions()/getSchemePermissions/fail');
		                    $location.path('/permissions/scheme');
		                });
		                
	                } else{
	                    Flash.create('info', '<strong>Notice!</strong> You don\'t have R permission to access this scheme.');
		                console.log('[NOTICE] Permissions/PermissionsCtrl.fetchPermissions()/getPermission/success');
		                $location.path('/permissions/scheme');
	                }
			    } else if(res != null && res.status == 204){
			        Flash.create('info', '<strong>Notice!</strong> You don\'t have R permission to access this scheme.');
		            console.log('[NOTICE] Permissions/PermissionsCtrl.fetchPermissions()/getPermission/success');
		            $location.path('/permissions/scheme');
			    } else{
			        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Permissions/PermissionsCtrl.fetchPermissions()/getPermission/success');
		            $location.path('/permissions/scheme');
			    }
		    }, (res) => {
		        // fail
		        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Permissions/PermissionsCtrl.fetchPermissions()/getPermission/fail');
		        $location.path('/permissions/scheme');
		    });
        } else {
            Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		    console.log('[FAIL] Permissions/PermissionsCtrl.fetchPermissions()/schemeId/fail');
		    $location.path('/permissions/scheme');
        }
    };
    
    $scope.fetchPermissions();
}])

.controller('PermissionCtrl', ['$scope', '$window', '$location', '$http', '$routeParams', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, $routeParams, Auth, Flash, Utils) {

    let modes = [
        {label:"Read only", value:"r"},
        {label:"Write only", value:"w"},
        {label:"Execute only", value:"x"},
        {label:"Read Write", value:"rw"},
        {label:"Read Execute", value:"rx"},
        {label:"Read Write Execute", value:"rwx"},
    ];
    
    $scope.schemes = [];
    $scope.users = [];
    $scope.modes = modes;
    
    $scope.config = {
        showSchemeInfo : false
    };
    
    $scope.showSchemeInfo = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $scope.config.showSchemeInfo = !$scope.config.showSchemeInfo;
    };
        
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
		
        $location.path('/permissions/' + $routeParams.schemeId);
    };
    
    $scope.refresh = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.run();
    };
    
    $scope.run = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.permission = {};
		$scope.schemes = [];
        $scope.users = [];
		$scope.permBoxTitle = "";
		
        let schemeId = $routeParams.schemeId,
            permissionId = $routeParams.permissionId;
        if(parseInt(schemeId) > 0){
            let profile = Auth.getUser();
            let urlCheckPermission = API_GW_URL + "permissions?q=(profileId=" + profile.id + ";schemeId="+schemeId+")&e=(permission,permission.scheme)&pageSize=1000";
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
	                    if(from <= now && to > now && isReadable){
	                        let s = {
	                            label : res.data.items[i].scheme.name,
	                            value : res.data.items[i].scheme._meta.id
	                        };
	                        $scope.schemes.push(s);
	                        $scope.selectedScheme = s;
	                        
	                        $scope.scheme = {
	                            id : res.data.items[i].scheme._meta.id,
                                name : res.data.items[i].scheme.name,
                                description : res.data.items[i].scheme.description,
                                version : parseInt(res.data.items[i].scheme.version),
                                lock : (parseInt(res.data.items[i].scheme.lock) == 1) ? true : false,
                                isWritable : isWritable
                            };
	                        hasPermission = true;
	                        break;
	                    }
	                }
	                
	                if(hasPermission){
	                
		                $http.get(API_GW_URL + "users?e=(user)&pageSize=1000").then((res) => {
		                    // success
			                if(res != null && res.data != null && res.status == 200){
	                            for(var i = 0; i < res.data.items.length; i++){
	                                $scope.users.push({
	                                    label : res.data.items[i].nick,
	                                    value : res.data.items[i]._meta.id
	                                });
	                            }
	                            
	                            if(parseInt(permissionId) > 0){
	                                $http.get(API_GW_URL + "permissions/" + permissionId).then((res) => {
		                                // success
			                            if(res != null && res.data != null && res.status == 200){
	                                        $scope.permission = res.data;
	                                        $scope.permBoxTitle = res.data._meta.id;
	                                        $scope.userBoxTitle = "View a values of the permission.";
	                                        for(let i = 0; i < $scope.users.length; i++){
	                                            if($scope.users[i].value == res.data.user._meta.id){
	                                                $scope.selectedUser = $scope.users[i];
	                                            }
	                                        }
		                                    for(let i = 0; i < $scope.modes.length; i++){
	                                            if($scope.modes[i].value == res.data.mode){
	                                                $scope.selectedMode = $scope.modes[i];
	                                            }
	                                        }
			                            } else{
			                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                    console.log('[FAIL]  Permissions/PermissionCtrl.run()/fetchExistingPermission/success');
		                                    $location.path('/permissions/' + schemeId);
			                            }
		                            }, (res) => {
		                                // fail
		                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                console.log('[FAIL] Permissions/PermissionCtrl.run()/fetchExistingPermission/fail');
		                                $location.path('/permissions/' + schemeId);
		                            });
	                            } else if (permissionId == "new"){
	                                $scope.permBoxTitle = "new";
	                                $scope.userBoxTitle = "Fill values of a new permission.";
	                                $scope.selectedMode = modes[0];
	                                $scope.permission = {
	                                    tsFrom : Utils.getMysqlTimeStamp(),
	                                    tsTo : Utils.getMysqlTimeStamp(new Date((new Date()).getTime() + PERMISSION_TO_INTERVAL))
	                                };
	                            } else{
	                                Flash.create('danger', '<strong>Oooops!</strong> Incorrect permission id. Try it again.');
		                            console.log('[FAIL]  Permissions/PermissionCtrl.run()/permissionId/fail');
		                            $location.path('/permissions/' + schemeId);
	                            }
		                
			                } else if(res != null && res.status == 204){
			                    Flash.create('info', '<strong>Notice!</strong> Not found any user.');
		                        console.log('[NOTICE]  Permissions/PermissionCtrl.run()/getUsers/success');
		                        $location.path('/permissions/' + schemeId);
			                } else{
			                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL]  Permissions/PermissionCtrl.run()/getUsers/success');
		                        $location.path('/permissions/' + schemeId);
			                }
		                }, (res) => {
		                    // fail
		                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                    console.log('[FAIL] Permissions/PermissionCtrl.run()/getUsers/fail');
		                    $location.path('/permissions/' + schemeId);
		                });
	                    
	                } else{
	                    Flash.create('info', '<strong>Notice!</strong> You don\'t have RW permission to access this scheme.');
		                console.log('[NOTICE]  Permissions/PermissionCtrl.run()/getPermission/success');
		                $location.path('/permissions/scheme');
	                }
			    } else if(res != null && res.status == 204){
			        Flash.create('info', '<strong>Notice!</strong> You don\'t have RW permission to access this scheme.');
		            console.log('[NOTICE]  Permissions/PermissionCtrl.run()/getPermission/success');
		            $location.path('/permissions/scheme');
			    } else{
			        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL]  Permissions/PermissionCtrl.run()/getPermission/success');
		            $location.path('/permissions/scheme');
			    }
		    }, (res) => {
		        // fail
		        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Permissions/PermissionCtrl.run()/getPermission/fail');
		        $location.path('/permissions/scheme');
		    });
        } else {
            Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		    console.log('[FAIL] Permissions/PermissionCtrl.run()/schemeId/fail');
		    $location.path('/permissions/scheme');
        }
    };
    
    
    $scope.submit = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		if ($scope.permissionForm.$valid){
            let schemeId = $routeParams.schemeId,
                permissionId = $routeParams.permissionId;
            if(parseInt(schemeId) > 0){
                let profile = Auth.getUser();
                let urlCheckPermission = API_GW_URL + "permissions?q=(profileId=" + profile.id + ";schemeId="+schemeId+")&e=(permission,permission.scheme)&pageSize=10";
		        $http.get(urlCheckPermission).then((res) => {
		            // success
			        if(res != null && res.data != null && res.status == 200){
	                    let hasPermission = false;
	                    for(var i = 0; i < res.data.items.length; i++){
	                        let from = Utils.mysqlTimeStampToDate(res.data.items[i].tsFrom),
	                            to = Utils.mysqlTimeStampToDate(res.data.items[i].tsTo),
	                            now = Date.now(),
	                            isReadable = /r/.test(res.data.items[i].mode),
	                            isWritable = /w/.test(res.data.items[i].mode),
	                            isExecutable = /x/.test(res.data.items[i].mode);
	                        if(from <= now && to > now && isReadable && isWritable){
	                            hasPermission = true;
	                            break;
	                        }
	                    }
	                    
	                    if(hasPermission){
	                        let urlPostPermission = API_GW_URL + "permissions/";
                            if(parseInt(permissionId) > 0){
                                $scope.permission.scheme = schemeId;
                                $scope.permission.user = $scope.selectedUser.value;
                                $scope.permission.mode = $scope.selectedMode.value;
                                
                                $http.post(urlPostPermission + permissionId, JSON.stringify($scope.permission)).then((res) => {
		                            // success
			                        if(res != null && res.status == 200){
			                            Flash.create('success', '<strong>Well done!</strong> You successfully updated permission.');
			                            $location.path('/permissions/' + schemeId);
			                        } else {
				                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                        console.log('[FAIL] Permissions/PermissionCtrl.submit()/postPermission/success');
				                        $location.path('/permissions/' + schemeId);
			                        }
		                        }, (res) => {
		                            // fail
		                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Permissions/PermissionCtrl.submit()/postPermission/fail');
		                            $location.path('/permissions/' + schemeId);
		                        });
                            } else if(permissionId == "new"){
                                $scope.permission.scheme = schemeId;
                                $scope.permission.user = $scope.selectedUser.value;
                                $scope.permission.mode = $scope.selectedMode.value;
                                let urlExistingPerm = API_GW_URL + "permissions?q=(profileId=" + $scope.permission.user + ";schemeId="+$scope.permission.scheme+")&pageSize=10";        
                                
                                $http.get(urlExistingPerm).then((res) => {
		                            // success
		                            if(res != null && res.status == 200){
		                                Flash.create('info', '<strong>Notice!</strong> Posted permission is not new. Try to modify existing permission first.');
		                                console.log('[NOTICE] Permissions/PermissionCtrl.submit()/getPermission/success');
		                                $location.path('/permissions/' + schemeId);
		                            } else if(res != null && res.status == 204){
                                        $http.post(urlPostPermission, JSON.stringify($scope.permission)).then((res) => {
		                                    // success
			                                if(res.status == 201){
			                                    Flash.create('success', '<strong>Well done!</strong> You successfully created new permission.');
			                                    $location.path('/permissions/' + schemeId);
			                                } else {
				                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                                console.log('[FAIL] Permissions/PermissionCtrl.submit()/postNewPermission/success');
				                                $location.path('/permissions/' + schemeId);
			                                }
		                                }, (res) => {
		                                    // fail
		                                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                    console.log('[FAIL] Permissions/PermissionCtrl.submit()/postNewPermission/fail');
		                                    $location.path('/permissions/' + schemeId);
		                                });
	                                } else{
			                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                console.log('[FAIL]  Permissions/PermissionCtrl.submit()/fetchExistingPermission/success');
		                                $location.path('/permissions/' + schemeId);
			                        }
		                        }, (res) => {
		                            // fail
		                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Permissions/PermissionCtrl.submit()/fetchExistingPermission/fail');
		                            $location.path('/permissions/' + schemeId);
		                        });
                            } else {
                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Permissions/PermissionCtrl.submit()/permissionId/fail');
		                        $location.path('/permissions/' + schemeId);
                            }
	                    } else{
	                        Flash.create('info', '<strong>Notice!</strong> You don\'t have RW permission to access this scheme.');
		                    console.log('[NOTICE] Permissions/PermissionCtrl.submit()/getPermission/success');
		                    $location.path('/permissions/scheme');
	                    }
			        } else if(res != null && res.status == 204){
			            Flash.create('info', '<strong>Notice!</strong> You don\'t have RW permission to access this scheme.');
		                console.log('[NOTICE] Permissions/PermissionCtrl.submit()/getPermission/success');
		                $location.path('/permissions/scheme');
			        } else{
			            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                console.log('[FAIL] Permissions/PermissionCtrl.submit()/getPermission/success');
		                $location.path('/permissions/scheme');
			        }
		        }, (res) => {
		            // fail
		            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Permissions/PermissionCtrl.submit()/getPermission/fail');
		            $location.path('/permissions/scheme');
		        });
            } else {
                Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		        console.log('[FAIL] Permissions/PermissionCtrl.submit()/schemeId/fail');
		        $location.path('/permissions/scheme');
            }
        }
    };
    
    $scope.run();
}]);
