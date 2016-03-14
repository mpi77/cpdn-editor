'use strict';

const API_GW_URL = "https://api.cpdn.sd2.cz/v1/";

angular.module('cpdnEditor.calculations', ['ngRoute'])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/calculations/executors', {
    templateUrl: 'components/calculations/executors.html',
    controller: 'ExecutorsCtrl'
  });
  
  $routeProvider.when('/calculations/tasks', {
    templateUrl: 'components/calculations/tasks.html',
    controller: 'TasksCtrl'
  });
  
  $routeProvider.when('/calculations/tasks/:taskId', {
    templateUrl: 'components/calculations/task.html',
    controller: 'TaskCtrl'
  });
  
}])

.controller('ExecutorsCtrl', ['$scope', '$window', '$location', '$http', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, Auth, Flash, Utils) {
    
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
		
		$scope.fetchExecutors();
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
    
    $scope.fetchExecutors = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.executors = [];
		$scope.paginator.totalPagesArray = [];
		
        let profile = Auth.getUser();
        let url = API_GW_URL + "executors?e=(executor)&pageSize=" + $scope.paginator.size.value + "&pageNumber=" + $scope.paginator.page;
		$http.get(url).then((res) => {
		    // success
			if(res != null && res.data != null && res.status == 200){
	            for(var i = 0; i < res.data.items.length; i++){
	                $scope.executors.push({
	                    id : res.data.items[i]._meta.id,
	                    title : res.data.items[i].title,
	                    status : res.data.items[i].status,
	                    tsUpdate : res.data.items[i]._meta.tsUpdate
	                });
	            }
	            $scope.paginator.totalItems = res.data.itemsTotal;
	            $scope.paginator.totalPages = res.data.pagesTotal;
	            for(var i = 0; i < $scope.paginator.totalPages; i++){
	                $scope.paginator.totalPagesArray.push(i + 1);
	            }
			} else if(res != null && res.status == 204){
			    Flash.create('info', '<strong>Notice!</strong> Not found any executor.');
		        console.log('[NOTICE] Calculations/ExecutorsCtrl.fetchExecutors()/getExecutors/success');
			} else{
			    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Calculations/ExecutorsCtrl.fetchExecutors()/getExecutors/success');
			}
		}, (res) => {
		    // fail
		    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Calculations/ExecutorsCtrl.fetchExecutors()/getExecutors/fail');
		});
    };
    
    $scope.fetchExecutors();
}])

.controller('TasksCtrl', ['$scope', '$window', '$location', '$http', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, Auth, Flash, Utils) {
    
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
        taskScope : 'my',
        taskStatus : 'all'
    };
    
    $scope.setTaskScope = function(value){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $scope.config.taskScope = value;
        $scope.refresh();
    };
    
    $scope.setTaskStatus = function(value){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $scope.config.taskStatus = value;
        $scope.refresh();
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
		
		$location.path('/calculations/tasks/new');
    };
    
    $scope.edit = function(taskId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$location.path('/calculations/tasks/' + taskId);
    };
                  
    $scope.refresh = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.fetchTasks();
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
    
    $scope.fetchTasks = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.tasks = [];
		$scope.paginator.totalPagesArray = [];
		
		let profile = Auth.getUser(),
		    query = "";
		    
		if($scope.config.taskScope == "my"){
		    query += "profileId=" + profile.id;
		}
		if($scope.config.taskStatus != "all"){
		    query += ((query.length > 0) ? ";" : "") + "status=" + $scope.config.taskStatus;
		}
		if(query.length > 0){
		    query = "&q=(" + query + ")";
		}
		
        let url = API_GW_URL + "tasks?e=(task,task.user,task.executor,task.scheme)&s=(id:desc)&pageSize=" + $scope.paginator.size.value + "&pageNumber=" + $scope.paginator.page + query;
		$http.get(url).then((res) => {
		    // success
			if(res != null && res.data != null && res.status == 200){
	            for(var i = 0; i < res.data.items.length; i++){
	                $scope.tasks.push({
	                    id : res.data.items[i]._meta.id,
	                    scheme : res.data.items[i].scheme.name,
	                    executor : res.data.items[i].executor.title,
	                    user : res.data.items[i].user.nick,
	                    status : res.data.items[i].status,
	                    priority : res.data.items[i].priority
	                });
	            }
	            $scope.paginator.totalItems = res.data.itemsTotal;
	            $scope.paginator.totalPages = res.data.pagesTotal;
	            for(var i = 0; i < $scope.paginator.totalPages; i++){
	                $scope.paginator.totalPagesArray.push(i + 1);
	            }
			} else if(res != null && res.status == 204){
			    Flash.create('info', '<strong>Notice!</strong> Not found any task.');
		        console.log('[NOTICE] Calculations/TasksCtrl.fetchTasks()/getTasks/success');
			} else{
			    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Calculations/TasksCtrl.fetchTasks()/getTasks/success');
			}
		}, (res) => {
		    // fail
		    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Calculations/TasksCtrl.fetchTasks()/getTasks/fail');
		});
    };
    
    $scope.fetchTasks();
}])

.controller('TaskCtrl', ['$scope', '$window', '$location', '$http', '$routeParams', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, $routeParams, Auth, Flash, Utils) {
    
    let methods = [
        {label:"Steady state of network (Gauss-Seidel)", value:"steadyStateGaussSeidel"},
        {label:"Steady state of network (Newton-Raphson)", value:"steadyStateNewtonRaphson"},
    ];
    
    $scope.schemes = [];
    $scope.executors = [];
    $scope.methods = methods;
    $scope.config = {
        isViewEnabled : false
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
		
        $location.path('/calculations/tasks');
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
		
		$scope.taskBoxTitle = "";
		
        let taskId = $routeParams.taskId,
            profile = Auth.getUser(),
            urlMyExecutableSchemes = API_GW_URL + "permissions?q=(profileId=" + profile.id + ")&e=(permission,permission.scheme)&pageSize=1000";
		
		$http.get(urlMyExecutableSchemes).then((res) => {
		    // success
			if(res != null && res.data != null && res.status == 200){
	            for(var i = 0; i < res.data.items.length; i++){
	                let from = Utils.mysqlTimeStampToDate(res.data.items[i].tsFrom),
	                    to = Utils.mysqlTimeStampToDate(res.data.items[i].tsTo),
	                    now = Date.now(),
	                    isReadable = /r/.test(res.data.items[i].mode),
	                    isWritable = /w/.test(res.data.items[i].mode),
	                    isExecutable = /x/.test(res.data.items[i].mode);
	                if(from <= now && to > now && isReadable && isExecutable && !(taskId == "new" && parseInt(res.data.items[i].scheme.lock) == 1)){
	                    $scope.schemes.push ({
	                        value : res.data.items[i].scheme._meta.id,
                            label : res.data.items[i].scheme.name
                        });
	                }
	            }
	                
		        $http.get(API_GW_URL + "executors?e=(executor)&pageSize=1000").then((res) => {
		            // success
			        if(res != null && res.data != null && res.status == 200){
	                    for(var i = 0; i < res.data.items.length; i++){
	                        $scope.executors.push({
	                            value : res.data.items[i]._meta.id,
	                            label : res.data.items[i].title
	                        });
	                    }
	                       
	                    if(parseInt(taskId) > 0){
                            $scope.userBoxTitle = "View a values of the task.";
                              
		                    $http.get(API_GW_URL + "tasks/" + taskId + "?e=(user,executor,scheme)").then((res) => {
		                        // success
			                    if(res != null && res.data != null && res.status == 200){
	                                $scope.config.isViewEnabled = false;
	                                $scope.taskBoxTitle = taskId;
	                                $scope.task = res.data;
	                                $scope.task.priority = parseInt($scope.task.priority);
	                                	                                    
	                                for(let i = 0; i < $scope.schemes.length; i++){
	                                    if($scope.schemes[i].value == res.data.scheme._meta.id){
	                                        $scope.selectedScheme = $scope.schemes[i];
	                                    }
	                                }
	                                for(let i = 0; i < $scope.executors.length; i++){
	                                    if($scope.executors[i].value == res.data.executor._meta.id){
	                                        $scope.selectedExecutor = $scope.executors[i];
	                                    }
	                                }
	                                
	                                if($scope.task.command != null && $scope.task.command.length > 0){
	                                    let method = JSON.parse($scope.task.command);
	                                    if(method != null && method.solveProblem){
	                                        for(let i = 0; i < $scope.methods.length; i++){
	                                            if($scope.methods[i].value == method.solveProblem){
	                                                $scope.selectedMethod = $scope.methods[i];
	                                            }
	                                        }
	                                    }
	                                }
			                    } else{
			                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Calculations/TaskCtrl.run()/getTask/success');
		                            $location.path('/calculations/tasks');
			                    }
		                    }, (res) => {
		                        // fail
		                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Calculations/TaskCtrl.run()/getTask/fail');
		                        $location.path('/calculations/tasks');
		                    });
                        } else if(taskId == "new") {
                            $scope.config.isViewEnabled = true;
                            $scope.userBoxTitle = "Fill values of a new task.";
                            $scope.taskBoxTitle = "new";
	                        $scope.task = {
	                            priority : 1,
	                            status : "preparing"
	                        };
	                    } else {
                            Flash.create('danger', '<strong>Oooops!</strong> Incorrect task id. Try it again.');
		                    console.log('[FAIL] Calculations/TaskCtrl.run()/taskId/fail');
		                    $location.path('/calculations/tasks');
                        }
	                        
			        } else if(res != null && res.status == 204){
			            Flash.create('info', '<strong>Notice!</strong> Not found any executor.');
		                console.log('[NOTICE] Calculations/TaskCtrl.run()/getExecutors/success');
		                $location.path('/calculations/tasks');
			        } else{
			            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                console.log('[FAIL] Calculations/TaskCtrl.run()/getExecutors/success');
		                $location.path('/calculations/tasks');
			        }
		        }, (res) => {
		            // fail
		            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Calculations/TaskCtrl.run()/getExecutors/fail');
		            $location.path('/calculations/tasks');
		        });
	                                
			} else if(res != null && res.status == 204){
			    Flash.create('info', '<strong>Notice!</strong> You don\'t have any scheme with RX permission.');
		        console.log('[NOTICE] Calculations/TaskCtrl.run()/getSchemes/success');
		        $location.path('/calculations/tasks');
			} else {
			    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Calculations/TaskCtrl.run()/getSchemes/success');
		        $location.path('/calculations/tasks');
			}
		}, (res) => {
		    // fail
		    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Calculations/TaskCtrl.run()/getSchemes/fail');
		    $location.path('/calculations/tasks');
		});
    };
    
    
    $scope.submit = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		if ($scope.taskForm.$valid){
            let schemeId = $scope.selectedScheme.value;
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
	                        if(from <= now && to > now && isReadable && isExecutable){
	                            hasPermission = true;
	                            break;
	                        }
	                    }
	                    
	                    if(hasPermission){
	                        let urlPostTask = API_GW_URL + "tasks/",
	                            taskId = $routeParams.taskId;
                            if(taskId == "new"){
                                $scope.task.user = profile.id;
                                $scope.task.scheme = schemeId;
                                $scope.task.executor = $scope.selectedExecutor.value;
                                $scope.task.command = JSON.stringify({
                                    solveProblem : $scope.selectedMethod.value
                                });
                                $scope.task.result = null;
                                $scope.task.status = "preparing";
                                
                                $http.post(urlPostTask, JSON.stringify($scope.task)).then((res) => {
		                            // success
			                        if(res.status == 201){
			                            Flash.create('success', '<strong>Well done!</strong> You successfully created new task.');
			                            $location.path('/calculations/tasks');
			                        } else {
				                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                        console.log('[FAIL] Calculations/TaskCtrl.submit()/postTask/success');
				                        $location.path('/calculations/tasks');
			                        }
		                        }, (res) => {
		                            // fail
		                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Calculations/TaskCtrl.submit()/postTask/fail');
		                            $location.path('/calculations/tasks');
		                        });
                            } else {
                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Calculations/TaskCtrl.submit()/taskId/fail');
		                        $location.path('/calculations/tasks');
                            }
	                    } else{
	                        Flash.create('info', '<strong>Notice!</strong> You don\'t have RX permission to access this scheme.');
		                    console.log('[NOTICE] Calculations/TaskCtrl.submit()/getPermission/success');
		                    $location.path('/calculations/tasks');
	                    }
			        } else if(res != null && res.status == 204){
			            Flash.create('info', '<strong>Notice!</strong> You don\'t have RX permission to access this scheme.');
		                console.log('[NOTICE] Calculations/TaskCtrl.submit()/getPermission/success');
		                $location.path('/calculations/tasks');
			        } else{
			            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                console.log('[FAIL] Calculations/TaskCtrl.submit()/getPermission/success');
		                $location.path('/calculations/tasks');
			        }
		        }, (res) => {
		            // fail
		            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Calculations/TaskCtrl.submit()/getPermission/fail');
		            $location.path('/calculations/tasks');
		        });
            } else {
                Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		        console.log('[FAIL] Calculations/TaskCtrl.submit()/schemeId/fail');
		        $location.path('/calculations/tasks');
            }
        }
    };
    
    $scope.confirm = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		if ($scope.taskConfirmForm.$valid){
            let taskId = $routeParams.taskId,
                profile = Auth.getUser();
            if(parseInt(taskId) > 0){
                $http.get(API_GW_URL + "tasks/" + taskId).then((res) => {
		            // success
			        if(res != null && res.data != null && res.status == 200){
			            let task = res.data,
			                schemeId = task.scheme._meta.id,
			                urlCheckPermission = API_GW_URL + "permissions?q=(profileId=" + profile.id + ";schemeId="+schemeId+")&e=(permission,permission.scheme)&pageSize=10",
			                urlPostScheme = API_GW_URL + "schemes/",
			                urlPostTask = API_GW_URL + "tasks/";
			                
		                $http.get(urlCheckPermission).then((res) => {
		                    // success
			                if(res != null && res.data != null && res.status == 200){
	                            let hasPermission = false;
	                            let scheme = null;
	                            for(var i = 0; i < res.data.items.length; i++){
	                                let from = Utils.mysqlTimeStampToDate(res.data.items[i].tsFrom),
	                                    to = Utils.mysqlTimeStampToDate(res.data.items[i].tsTo),
	                                    now = Date.now(),
	                                    isReadable = /r/.test(res.data.items[i].mode),
	                                    isWritable = /w/.test(res.data.items[i].mode),
	                                    isExecutable = /x/.test(res.data.items[i].mode);
	                                if(from <= now && to > now && isReadable && isExecutable){
	                                    scheme = res.data.items[i].scheme;
	                                    hasPermission = true;
	                                    break;
	                                }
	                            }
	                            
	                            if(hasPermission){
	                                scheme.lock = 1;
	                                $http.post(urlPostScheme + schemeId, JSON.stringify(scheme)).then((res) => {
		                                // success
			                            if(res.status == 200){
			                                task.scheme = task.scheme._meta.id;
			                                task.executor = task.executor._meta.id;
			                                task.user = task.user._meta.id;
			                                task.status = "new";
			                                $http.post(urlPostTask + taskId, JSON.stringify(task)).then((res) => {
		                                        // success
			                                    if(res.status == 200){
			                                        Flash.create('success', '<strong>Well done!</strong> You successfully updated the task.');
			                                        $location.path('/calculations/tasks');
			                                    } else {
				                                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                                    console.log('[FAIL] Calculations/TaskCtrl.confirm()/postNewTask/success');
				                                    $location.path('/calculations/tasks');
			                                    }
		                                    }, (res) => {
		                                        // fail
		                                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                        console.log('[FAIL] Calculations/TaskCtrl.confirm()/postNewTask/fail');
		                                        $location.path('/calculations/tasks');
		                                    });    
			                                
			                            } else {
				                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                            console.log('[FAIL] Calculations/TaskCtrl.confirm()/postLockScheme/success');
				                            $location.path('/calculations/tasks');
			                            }
		                            }, (res) => {
		                                // fail
		                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                console.log('[FAIL] Calculations/TaskCtrl.confirm()/postLockScheme/fail');
		                                $location.path('/calculations/tasks');
		                            });
	                            } else{
	                                Flash.create('info', '<strong>Notice!</strong> You don\'t have RX permission to access this scheme.');
		                            console.log('[NOTICE] Calculations/TaskCtrl.confirm()/getPermission/success');
		                            $location.path('/calculations/tasks');
	                            }
			                } else if(res != null && res.status == 204){
			                    Flash.create('info', '<strong>Notice!</strong> You don\'t have RX permission to access this scheme.');
		                        console.log('[NOTICE] Calculations/TaskCtrl.confirm()/getPermission/success');
		                        $location.path('/calculations/tasks');
			                } else{
			                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Calculations/TaskCtrl.confirm()/getPermission/success');
		                        $location.path('/calculations/tasks');
			                }
		                }, (res) => {
		                    // fail
		                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                    console.log('[FAIL] Calculations/TaskCtrl.confirm()/getPermission/fail');
		                    $location.path('/calculations/tasks');
		                });
			        } else{
			            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                console.log('[FAIL] Calculations/TaskCtrl.confirm()/getTask/success');
		                $location.path('/calculations/tasks');
			        }
		        }, (res) => {
		            // fail
		            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Calculations/TaskCtrl.confirm()/getTask/fail');
		            $location.path('/calculations/tasks');
		        });
            } else {
		        Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		        console.log('[FAIL] Calculations/TaskCtrl.confirm()/taskId/fail');
		        $location.path('/calculations/tasks');
		    }
        }
    };
    
    $scope.run();
}]);
