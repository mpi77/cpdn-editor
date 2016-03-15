'use strict';

const API_GW_URL = "https://api.cpdn.sd2.cz/v1/";

angular.module('cpdnEditor.elements', ['ngRoute'])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/elements/scheme', {
    templateUrl: 'components/elements/select-scheme.html',
    controller: 'ElementsSelectSchemeCtrl'
  });
  
  $routeProvider.when('/elements/:schemeId/points', {
    templateUrl: 'components/elements/points.html',
    controller: 'PointsCtrl'
  });
  
  $routeProvider.when('/elements/:schemeId/points/:pointId', {
    templateUrl: 'components/elements/point.html',
    controller: 'PointCtrl'
  });
  
  $routeProvider.when('/elements/:schemeId/nodes', {
    templateUrl: 'components/elements/nodes.html',
    controller: 'NodesCtrl'
  });
  
  $routeProvider.when('/elements/:schemeId/nodes/:nodeId', {
    templateUrl: 'components/elements/node.html',
    controller: 'NodeCtrl'
  });
  
  $routeProvider.when('/elements/:schemeId/sections', {
    templateUrl: 'components/elements/sections.html',
    controller: 'SectionsCtrl'
  });
  
  $routeProvider.when('/elements/:schemeId/sections/:sectionId', {
    templateUrl: 'components/elements/section.html',
    controller: 'SectionCtrl'
  });
  
  $routeProvider.when('/elements/:schemeId/objects', {
    templateUrl: 'components/elements/objects.html',
    controller: 'ObjectsCtrl'
  });
  
  $routeProvider.when('/elements/:schemeId/objects/:objectId', {
    templateUrl: 'components/elements/object.html',
    controller: 'ObjectCtrl'
  });
  
}])

.controller('ElementsSelectSchemeCtrl', ['$scope', '$http', '$window', '$location', 'Auth', 'Utils', 'Flash', function($scope, $http, $window, $location, Auth, Utils, Flash) {
    $scope.go = function(type){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		if($scope.selectedScheme && $scope.selectedScheme.id > 0 && (type == "nodes" || type == "sections" || type == "objects" || type == "points")){
		    $location.path('/elements/' + $scope.selectedScheme.id + '/' + type);
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
		        console.log('[NOTICE] Elements/ElementsSelectSchemeCtrl.fetchSchemes()/getScheme/success');
			} else{
			    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Elements/ElementsSelectSchemeCtrl.fetchSchemes()/getScheme/success');
			}
		}, (res) => {
		    // fail
		    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Elements/ElementsSelectSchemeCtrl.fetchSchemes()/getScheme/fail');
		});
    };
    
    $scope.fetchSchemes();
  
}])

.controller('NodesCtrl', ['$scope', '$window', '$location', '$http', '$routeParams', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, $routeParams, Auth, Flash, Utils) {
    
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
    
    $scope.showSchematicMap = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $location.path('/maps/schematic/' + $routeParams.schemeId);
    };
    
    $scope.showScheme = function(what){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $location.path('/elements/' + $routeParams.schemeId + '/' + what);
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
		
		$location.path('/elements/' + $routeParams.schemeId + '/nodes/' + 'new');
    };
    
    $scope.edit = function(nodeId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$location.path('/elements/' + $routeParams.schemeId + '/nodes/' + nodeId);
    };
    
    $scope.delete = function(nodeId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$http.delete(API_GW_URL + "nodes/" + nodeId).then((res) => {
		    // success
			if(res.status == 200){
				Flash.create('success', '<strong>Well done!</strong> You successfully removed node.');
			} else{
				Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				console.log('[FAIL] Elements/NodesCtrl.delete()/deleteNode/success');
			}
			$location.path('/elements/' + $routeParams.schemeId + '/nodes');
			$scope.refresh();
		}, (res) => {
		    // fail
		    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Elements/NodesCtrl.delete()/deleteNode/fail');
		});
    };
    
    $scope.refresh = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.fetchNodes();
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
    
    $scope.fetchNodes = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.nodes = [];
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
		                
		                let urlNodes = API_GW_URL + "nodes/?q=(schemeId=" + schemeId + ")&e=(node,node.calc,node.spec,node.mapPoint)&pageSize=" + $scope.paginator.size.value + "&pageNumber=" + $scope.paginator.page;
		                $http.get(urlNodes).then((res) => {
		                    // success
			                if(res != null && res.data != null && res.status == 200){
	                            for(var i = 0; i < res.data.items.length; i++){
	                                let voltageCalc = parseInt(res.data.items[i].calc.voltage.value),
			                            voltageSpec = parseInt(res.data.items[i].spec.voltage.level),
			                            result = "fault";		             
			                        if(voltageCalc == voltageSpec){
			                            result = "ok";
			                        } else if(Math.abs(voltageCalc - voltageSpec) <= (voltageSpec * 0.05)){
			                            result = "tolerance";
			                        } 
	                                $scope.nodes.push({
	                                    id : res.data.items[i]._meta.id,
	                                    label : res.data.items[i].spec.label,
	                                    type : res.data.items[i].spec.type,
	                                    x : res.data.items[i].mapPoint.x,
	                                    y : res.data.items[i].mapPoint.y,
	                                    result : result
	                                });
	                            }
	                            $scope.paginator.totalItems = res.data.itemsTotal;
	                            $scope.paginator.totalPages = res.data.pagesTotal;
	                            for(var i = 0; i < $scope.paginator.totalPages; i++){
	                                $scope.paginator.totalPagesArray.push(i + 1);
	                            }
			                } else if(res != null && res.status == 204){
			                    Flash.create('info', '<strong>Notice!</strong> Not found any node.');
		                        console.log('[NOTICE] Elements/NodesCtrl.fetchNodes()/getNodes/success');
			                } else{
			                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Elements/NodesCtrl.fetchNodes()/getNodes/success');
		                        $location.path('/elements/scheme');
			                }
		                }, (res) => {
		                    // fail
		                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                    console.log('[FAIL] Elements/NodesCtrl.fetchNodes()/getNodes/fail');
		                    $location.path('/elements/scheme');
		                });
		                
	                } else{
	                    Flash.create('info', '<strong>Notice!</strong> You don\'t have R permission to access this scheme.');
		                console.log('[NOTICE] Elements/NodesCtrl.fetchNodes()/getPermission/success');
		                $location.path('/elements/scheme');
	                }
			    } else if(res != null && res.status == 204){
			        Flash.create('info', '<strong>Notice!</strong> You don\'t have R permission to access this scheme.');
		            console.log('[NOTICE] Elements/NodesCtrl.fetchNodes()/getPermission/success');
		            $location.path('/elements/scheme');
			    } else{
			        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Elements/NodesCtrl.fetchNodes()/getPermission/success');
		            $location.path('/elements/scheme');
			    }
		    }, (res) => {
		        // fail
		        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Elements/NodesCtrl.fetchNodes()/getPermission/fail');
		        $location.path('/elements/scheme');
		    });
        } else {
            Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		    console.log('[FAIL] Elements/NodesCtrl.fetchNodes()/schemeId/fail');
		    $location.path('/elements/scheme');
        }
    };
    
    $scope.fetchNodes();
}])

.controller('NodeCtrl', ['$scope', '$window', '$location', '$http', '$routeParams', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, $routeParams, Auth, Flash, Utils) {
    
    let nodeTypes = [
        {label:"Power node", value:"power"},
        {label:"Consumption node", value:"consumption"},
        {label:"Turbogen", value:"turbogen"},
        {label:"Hydrogen", value:"hydrogen"},
        {label:"Superior system", value:"superiorSystem"}
    ];
    
    $scope.nodeTypes = nodeTypes;
    $scope.points = [];
    
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
		
        $location.path('/elements/' + $routeParams.schemeId + '/nodes');
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
		
		$scope.node = {};
		$scope.nodeBoxTitle = "";
		
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
	                
	                    $http.get(API_GW_URL + "mapPoints/?q=(schemeId=" + schemeId + ")&e=(mapPoint)&pageSize=1000").then((res) => {
		                    // success
			                if(res != null && res.data != null && res.status == 200){
	                            $scope.points = [];
	                            for(let i = 0; i < res.data.items.length; i++){
	                                $scope.points.push({
	                                    label : "[id:" + res.data.items[i]._meta.id + "] [x:" + res.data.items[i].x + ", y:" + res.data.items[i].y + "]",
	                                    value : res.data.items[i]._meta.id
	                                });
	                            }
	                            
	                            let nodeId = $routeParams.nodeId;
	                            if(parseInt(nodeId) > 0){
		                            $http.get(API_GW_URL + "nodes/" + nodeId + "?e=(calc,spec)").then((res) => {
		                                // success
			                            if(res != null && res.data != null && res.status == 200){
	                                        $scope.node = res.data;
	                                        $scope.nodeBoxTitle = nodeId;
	                                        
	                                        let voltageCalc = parseInt(res.data.calc.voltage.value),
			                                    voltageSpec = parseInt(res.data.spec.voltage.level),
			                                    result = "fault";		             
			                                if(voltageCalc == voltageSpec){
			                                    result = "ok";
			                                } else if(Math.abs(voltageCalc - voltageSpec) <= (voltageSpec * 0.05)){
			                                    result = "tolerance";
			                                }
			                                $scope.node.result = result;
			                                 
	                                        for(let i = 0; i < $scope.points.length; i++){
	                                            if(res.data.mapPoint._meta.id == $scope.points[i].value){
	                                                $scope.selectedMapPoint = $scope.points[i];
	                                            }
	                                        }
	                                        for(let i = 0; i < nodeTypes.length; i++){
	                                            if(res.data.spec.type == nodeTypes[i].value){
	                                                $scope.selectedNodeType = nodeTypes[i];
	                                            }
	                                        }
			                            }  else{
			                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                    console.log('[FAIL] Elements/NodeCtrl.run()/getNode/success');
		                                    $location.path('/elements/' + schemeId + '/nodes');
			                            }
		                            }, (res) => {
		                                // fail
		                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                console.log('[FAIL] Elements/NodeCtrl.run()/getNode/fail');
		                                $location.path('/elements/' + schemeId + '/nodes');
		                            });
		                        } else {
		                            $scope.node = {
                                        calc : {
                                            load: {
                                                active: 0,
                                                reactive: 0
                                            },
                                            voltage: {
                                                dropKv: 0,
                                                dropProc: 0,
                                                phase: 0,
                                                value: 0
                                            }
                                        },
                                        result : "ok",
                                        spec : {
                                            type: "",
                                            label: "",
                                            cosFi: 0,
                                            mi: 0,
                                            lambda: {
                                                "max": 0,
                                                "min": 0
                                            },
                                            power: {
                                                active: 0,
                                                installed: 0,
                                                rated: 0,
                                                reactive: 0
                                            },
                                            reactance: {
                                                longitudinal: 0,
                                                transverse: 0
                                            },
                                            voltage: {
                                                level: 0,
                                                phase: 0,
                                                rated: 0,
                                                value: 0
                                            }
                                        }
                                    };
                                    $scope.nodeBoxTitle = "new";
                                    $scope.selectedNodeType = nodeTypes[0];
		                        }
			                }  else {
			                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Elements/NodeCtrl.run()/getMapPoints/success');
		                        $location.path('/elements/' + schemeId + '/nodes');
			                }
		                }, (res) => {
		                    // fail
		                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                    console.log('[FAIL] Elements/NodeCtrl.run()/getMapPoints/fail');
		                    $location.path('/elements/' + schemeId + '/nodes');
		                });
	                } else{
	                    Flash.create('info', '<strong>Notice!</strong> You don\'t have RW permission to access this scheme.');
		                console.log('[NOTICE]  Elements/NodeCtrl.run()/getPermission/success');
		                $location.path('/elements/scheme');
	                }
			    } else if(res != null && res.status == 204){
			        Flash.create('info', '<strong>Notice!</strong> You don\'t have RW permission to access this scheme.');
		            console.log('[NOTICE]  Elements/NodeCtrl.run()/getPermission/success');
		            $location.path('/elements/scheme');
			    } else{
			        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL]  Elements/NodeCtrl.run()/getPermission/success');
		            $location.path('/elements/scheme');
			    }
		    }, (res) => {
		        // fail
		        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Elements/NodeCtrl.run()/getPermission/fail');
		        $location.path('/elements/scheme');
		    });
        } else {
            Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		    console.log('[FAIL] Elements/NodeCtrl.run()/schemeId/fail');
		    $location.path('/elements/scheme');
        }
    };
    
    
    $scope.submit = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		if ($scope.nodeForm.$valid){
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
	                        if(from <= now && to > now && isReadable && isWritable){
	                            hasPermission = true;
	                            break;
	                        }
	                    }
	                    
	                    if(hasPermission){
	                    
	                        let urlPostNode = API_GW_URL + "nodes/",
	                            nodeId = $routeParams.nodeId;
                            if(parseInt(nodeId) > 0){
                                urlPostNode = urlPostNode + nodeId + "/";
                                
                                $http.post(urlPostNode + "mapPoint", JSON.stringify({mapPoint:$scope.selectedMapPoint.value})).then((res) => {
		                            // success
			                        if(res.status == 200){
			                            $scope.node.spec.type = $scope.selectedNodeType.value;
			                            
			                            $http.post(urlPostNode + "spec", JSON.stringify($scope.node.spec)).then((res) => {
		                                    // success
			                                if(res.status == 200){
			                                    Flash.create('success', '<strong>Well done!</strong> You successfully updated node.');
			                                    $location.path('/elements/' + schemeId + '/nodes');
			                                } else {
				                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                                console.log('[FAIL] Elements/NodeCtrl.submit()/postNode/spec/success');
				                                $location.path('/elements/' + schemeId + '/nodes');
			                                }
		                                }, (res) => {
		                                    // fail
		                                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                    console.log('[FAIL] Elements/NodeCtrl.submit()/postNode/spec/fail');
		                                    $location.path('/elements/' + schemeId + '/nodes');
		                                });
			                        } else {
				                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                        console.log('[FAIL] Elements/NodeCtrl.submit()/postNode/mapPoint/success');
				                        $location.path('/elements/' + schemeId + '/nodes');
			                        }
		                        }, (res) => {
		                            // fail
		                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Elements/NodeCtrl.submit()/postNode/mapPoint/fail');
		                            $location.path('/elements/' + schemeId + '/nodes');
		                        });
                            } else if(nodeId == "new"){
                                let node = {
                                    calc : $scope.node.calc,
                                    mapPoint : $scope.selectedMapPoint.value,
                                    scheme : schemeId,
                                    spec : $scope.node.spec
                                };
                                node.spec.type = $scope.selectedNodeType.value;
                                                            
                                $http.post(urlPostNode, JSON.stringify(node)).then((res) => {
		                            // success
			                        if(res.status == 201){
			                            Flash.create('success', '<strong>Well done!</strong> You successfully created new node.');
			                            $location.path('/elements/' + schemeId + '/nodes');
			                        } else {
				                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                        console.log('[FAIL] Elements/NodeCtrl.submit()/postNewNode/success');
				                        $location.path('/elements/' + schemeId + '/nodes');
			                        }
		                        }, (res) => {
		                            // fail
		                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Elements/NodeCtrl.submit()/postNewNode/fail');
		                            $location.path('/elements/' + schemeId + '/nodes');
		                        });
                            } else {
                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Elements/NodeCtrl.submit()/postNode/fail');
		                        $location.path('/elements/' + schemeId + '/nodes');
                            }
	                    } else{
	                        Flash.create('info', '<strong>Notice!</strong> You don\'t have W permission to access this scheme.');
		                    console.log('[NOTICE]  Elements/NodeCtrl.submit()/getPermission/success');
		                    $location.path('/elements/scheme');
	                    }
			        } else if(res != null && res.status == 204){
			            Flash.create('info', '<strong>Notice!</strong> You don\'t have W permission to access this scheme.');
		                console.log('[NOTICE]  Elements/NodeCtrl.submit()/getPermission/success');
		                $location.path('/elements/scheme');
			        } else{
			            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                console.log('[FAIL]  Elements/NodeCtrl.submit()/getPermission/success');
		                $location.path('/elements/scheme');
			        }
		        }, (res) => {
		            // fail
		            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Elements/NodeCtrl.submit()/getPermission/fail');
		            $location.path('/elements/scheme');
		        });
            } else {
                Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		        console.log('[FAIL] Elements/NodeCtrl.submit()/schemeId/fail');
		        $location.path('/elements/scheme');
            }
        }
    };
    
    
    $scope.run();
}])

.controller('SectionsCtrl', ['$scope', '$window', '$location', '$http', '$routeParams', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, $routeParams, Auth, Flash, Utils) {
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
    
    $scope.showNodeInfo = function(nodeId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
    };
    
    $scope.showSchematicMap = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $location.path('/maps/schematic/' + $routeParams.schemeId);
    };
    
    $scope.showScheme = function(what){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $location.path('/elements/' + $routeParams.schemeId + '/' + what);
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
		
		$location.path('/elements/' + $routeParams.schemeId + '/sections/' + 'new');
    };
    
    $scope.edit = function(sectionId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$location.path('/elements/' + $routeParams.schemeId + '/sections/' + sectionId);
    };
    
    $scope.delete = function(sectionId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$http.delete(API_GW_URL + "sections/" + sectionId).then((res) => {
		    // success
			if(res.status == 200){
				Flash.create('success', '<strong>Well done!</strong> You successfully removed section.');
			} else{
				Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				console.log('[FAIL] Elements/SectionsCtrl.delete()/deleteSection/success');
			}
			$location.path('/elements/' + $routeParams.schemeId + '/nodes');
			$scope.refresh();
		}, (res) => {
		    // fail
		    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Elements/SectionsCtrl.delete()/deleteSection/fail');
		});
    };
    
    $scope.refresh = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.fetchSections();
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
    
    $scope.fetchSections = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.sections = [];
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
		                
		                let urlSections = API_GW_URL + "sections/?q=(schemeId=" + schemeId + ")&e=(section,section.calc,section.spec,section.nodes)&pageSize=" + $scope.paginator.size.value + "&pageNumber=" + $scope.paginator.page;
		                $http.get(urlSections).then((res) => {
		                    // success
			                if(res != null && res.data != null && res.status == 200){
	                            for(var i = 0; i < res.data.items.length; i++){
	                                let maxCurrent = parseInt(res.data.items[i].spec.current.max),
			                            srcCurrent = parseInt(res.data.items[i].calc.current.src.value),
			                            dstCurrent = parseInt(res.data.items[i].calc.current.dst.value),
			                            result = "fault";		             
			                        if(srcCurrent <= maxCurrent && dstCurrent <= maxCurrent){
			                            result = "ok";
			                        } 
	                                $scope.sections.push({
	                                    id : res.data.items[i]._meta.id,
	                                    label : res.data.items[i].spec.label,
	                                    type : res.data.items[i].spec.type,
	                                    from : res.data.items[i].nodes.src._meta.id,
	                                    to : res.data.items[i].nodes.dst._meta.id,
	                                    result : result
	                                });
	                            }
	                            $scope.paginator.totalItems = res.data.itemsTotal;
	                            $scope.paginator.totalPages = res.data.pagesTotal;
	                            for(var i = 0; i < $scope.paginator.totalPages; i++){
	                                $scope.paginator.totalPagesArray.push(i + 1);
	                            }
			                } else if(res != null && res.status == 204){
			                    Flash.create('info', '<strong>Notice!</strong> Not found any node.');
		                        console.log('[NOTICE] Elements/SectionsCtrl.fetchSections()/getSections/success');
			                } else{
			                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Elements/SectionsCtrl.fetchSections()/getSections/success');
		                        $location.path('/elements/scheme');
			                }
		                }, (res) => {
		                    // fail
		                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                    console.log('[FAIL] Elements/SectionsCtrl.fetchSections()/getSections/fail');
		                    $location.path('/elements/scheme');
		                });
		                
	                } else{
	                    Flash.create('info', '<strong>Notice!</strong> You don\'t have R permission to access this scheme.');
		                console.log('[NOTICE] Elements/SectionsCtrl.fetchSections()/getPermission/success');
		                $location.path('/elements/scheme');
	                }
			    } else if(res != null && res.status == 204){
			        Flash.create('info', '<strong>Notice!</strong> You don\'t have R permission to access this scheme.');
		            console.log('[NOTICE] Elements/SectionsCtrl.fetchSections()/getPermission/success');
		            $location.path('/elements/scheme');
			    } else{
			        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Elements/SectionsCtrl.fetchSections()/getPermission/success');
		            $location.path('/elements/scheme');
			    }
		    }, (res) => {
		        // fail
		        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Elements/SectionsCtrl.fetchSections()/getPermission/fail');
		        $location.path('/elements/scheme');
		    });
        } else {
            Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		    console.log('[FAIL] Elements/SectionsCtrl.fetchSections()/schemeId/fail');
		    $location.path('/elements/scheme');
        }
    };
    
    $scope.fetchSections();
}])

.controller('SectionCtrl', ['$scope', '$window', '$location', '$http', '$routeParams', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, $routeParams, Auth, Flash, Utils) {
    
    let sectionTypes = [
        {label:"Line", value:"line"},
        {label:"Transformer", value:"transformer"},
        {label:"Transformer W3", value:"transformerW3"},
        {label:"Reactor", value:"reactor"},
        {label:"Switch", value:"switch"}
    ];
    
    $scope.sectionTypes = sectionTypes;
    $scope.nodes = [];
    
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
		
        $location.path('/elements/' + $routeParams.schemeId + '/sections');
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
		
		$scope.section = {};
		$scope.selectedNodes = {src:null,dst:null,trc:null};
		$scope.sectionBoxTitle = "";
		
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
	                
	                    $http.get(API_GW_URL + "nodes/?q=(schemeId=" + schemeId + ")&e=(node,node.spec)&pageSize=1000").then((res) => {
		                    // success
			                if(res != null && res.data != null && res.status == 200){
	                            $scope.nodes = [];
	                            for(let i = 0; i < res.data.items.length; i++){
	                                $scope.nodes.push({
	                                    label : "[id:" + res.data.items[i]._meta.id + "] " + res.data.items[i].spec.label,
	                                    value : res.data.items[i]._meta.id
	                                });
	                            }
	                            
	                            let sectionId = $routeParams.sectionId;
	                            if(parseInt(sectionId) > 0){
		                            $http.get(API_GW_URL + "sections/" + sectionId + "?e=(calc,spec,nodes)").then((res) => {
		                                // success
			                            if(res != null && res.data != null && res.status == 200){
	                                        $scope.section = res.data;
	                                        $scope.sectionBoxTitle = sectionId;
	                                        
	                                        let maxCurrent = parseInt(res.data.spec.current.max),
			                                    srcCurrent = parseInt(res.data.calc.current.src.value),
			                                    dstCurrent = parseInt(res.data.calc.current.dst.value),
			                                    result = "fault";     
			                                if( srcCurrent <= maxCurrent && dstCurrent <= maxCurrent){
			                                    result = "ok";
			                                } 
			                                $scope.section.result = result;
			                                $scope.section.spec.status = ($scope.section.spec.status == "on") ? true : false;
			                                 
	                                        for(let i = 0; i < $scope.nodes.length; i++){
	                                            if(res.data.nodes.src._meta.id == $scope.nodes[i].value){
	                                                $scope.selectedNodes.src = $scope.nodes[i];
	                                            }
	                                            if(res.data.nodes.dst._meta.id == $scope.nodes[i].value){
	                                                $scope.selectedNodes.dst = $scope.nodes[i];
	                                            }
	                                            if(res.data.nodes.trc != null && res.data.nodes.trc._meta.id == $scope.nodes[i].value){
	                                                $scope.selectedNodes.trc = $scope.nodes[i];
	                                            }
	                                        }
	                                        
	                                        for(let i = 0; i < sectionTypes.length; i++){
	                                            if(res.data.spec.type == sectionTypes[i].value){
	                                                $scope.selectedSectionType = sectionTypes[i];
	                                            }
	                                        }
			                            }  else{
			                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                    console.log('[FAIL] Elements/NodeCtrl.run()/getSection/success');
		                                    $location.path('/elements/' + schemeId + '/sections');
			                            }
		                            }, (res) => {
		                                // fail
		                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                console.log('[FAIL] Elements/NodeCtrl.run()/getSection/fail');
		                                $location.path('/elements/' + schemeId + '/sections');
		                            });
		                        } else {
		                            $scope.section = {
                                        calc : {
                                            current: {
                                                dst: {
                                                    phase: 0,
                                                    ratio: 0,
                                                    value: 0
                                                },
                                                src: {
                                                    phase: 0,
                                                    ratio: 0,
                                                    value: 0
                                                }
                                            },
                                            losses: {
                                                active: 0,
                                                reactive: 0
                                            },
                                            power: {
                                                dst: {
                                                    active: 0,
                                                    reactive: 0
                                                },
                                                src: {
                                                    active: 0,
                                                    reactive: 0
                                                }
                                            }
                                        },
                                        result : "ok",
                                        spec : {
                                            label: "",
                                            conductance: 0,
                                            status: false,
                                            susceptance: 0,
                                            current: {
                                                max: 0,
                                                noLoad: 0
                                            },
                                            reactance: {
                                                ratio: 0,
                                                value: 0
                                            },
                                            resistance: {
                                                ratio: 0,
                                                value: 0
                                            },
                                            losses: {
                                                noLoad: 0,
                                                short: {
                                                    ab: 0,
                                                    ac: 0,
                                                    bc: 0
                                                }
                                            },
                                            power: {
                                                rated: {
                                                    ab: 0,
                                                    ac: 0,
                                                    bc: 0
                                                }
                                            },
                                            voltage: {
                                                pri: {
                                                    actual: 0,
                                                    rated: 0
                                                },
                                                sec: {
                                                    actual: 0,
                                                    rated: 0
                                                },
                                                trc: {
                                                    actual: 0,
                                                    rated: 0
                                                },
                                                short: {
                                                    ab: 0,
                                                    ac: 0,
                                                    bc: 0
                                                }
                                            }
                                        }
                                    };
                                    $scope.sectionBoxTitle = "new";
                                    $scope.selectedSectionType = sectionTypes[0];
		                        }
			                }  else {
			                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Elements/SectionCtrl.run()/getNodes/success');
		                        $location.path('/elements/' + schemeId + '/sections');
			                }
		                }, (res) => {
		                    // fail
		                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                    console.log('[FAIL] Elements/SectionCtrl.run()/getNodes/fail');
		                    $location.path('/elements/' + schemeId + '/sections');
		                });
	                } else{
	                    Flash.create('info', '<strong>Notice!</strong> You don\'t have RW permission to access this scheme.');
		                console.log('[NOTICE]  Elements/SectionCtrl.run()/getPermission/success');
		                $location.path('/elements/scheme');
	                }
			    } else if(res != null && res.status == 204){
			        Flash.create('info', '<strong>Notice!</strong> You don\'t have RW permission to access this scheme.');
		            console.log('[NOTICE]  Elements/SectionCtrl.run()/getPermission/success');
		            $location.path('/elements/scheme');
			    } else{
			        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL]  Elements/SectionCtrl.run()/getPermission/success');
		            $location.path('/elements/scheme');
			    }
		    }, (res) => {
		        // fail
		        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Elements/SectionCtrl.run()/getPermission/fail');
		        $location.path('/elements/scheme');
		    });
        } else {
            Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		    console.log('[FAIL] Elements/SectionCtrl.run()/schemeId/fail');
		    $location.path('/elements/scheme');
        }
    };
    
    
    $scope.submit = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		if ($scope.sectionForm.$valid){
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
	                        if(from <= now && to > now && isReadable && isWritable){
	                            hasPermission = true;
	                            break;
	                        }
	                    }
	                    
	                    if(hasPermission){
	                    
	                        let urlPostSection = API_GW_URL + "sections/",
	                            sectionId = $routeParams.sectionId;
                            if(parseInt(sectionId) > 0){
                                urlPostSection = urlPostSection + sectionId + "/";
                                let nodes = {
                                    dst : $scope.selectedNodes.dst.value,
                                    src : $scope.selectedNodes.src.value,
                                    trc : ($scope.selectedNodes.trc != null && parseInt($scope.selectedNodes.trc.value) > 0) ? $scope.selectedNodes.trc.value : null
                                };
                                $http.post(urlPostSection + "nodes", JSON.stringify(nodes)).then((res) => {
		                            // success
			                        if(res.status == 200){
			                            $scope.section.spec.type = $scope.selectedSectionType.value;
			                            $scope.section.spec.status = ($scope.section.spec.status != null && $scope.section.spec.status == true) ? "on" : "off";
			                            
			                            $http.post(urlPostSection + "spec", JSON.stringify($scope.section.spec)).then((res) => {
		                                    // success
			                                if(res.status == 200){
			                                    Flash.create('success', '<strong>Well done!</strong> You successfully updated section.');
			                                    $location.path('/elements/' + schemeId + '/sections');
			                                } else {
				                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                                console.log('[FAIL] Elements/SectionCtrl.submit()/postSection/spec/success');
				                                $location.path('/elements/' + schemeId + '/sections');
			                                }
		                                }, (res) => {
		                                    // fail
		                                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                    console.log('[FAIL] Elements/SectionCtrl.submit()/postSection/spec/fail');
		                                    $location.path('/elements/' + schemeId + '/sections');
		                                });
			                        } else {
				                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                        console.log('[FAIL] Elements/SectionCtrl.submit()/postSection/nodes/success');
				                        $location.path('/elements/' + schemeId + '/sections');
			                        }
		                        }, (res) => {
		                            // fail
		                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Elements/SectionCtrl.submit()/postSection/nodes/fail');
		                            $location.path('/elements/' + schemeId + '/sections');
		                        });
                            } else if(sectionId == "new"){
                                let section = {
                                    calc : $scope.section.calc,
                                    nodes : {
                                        dst : $scope.selectedNodes.dst.value,
                                        src : $scope.selectedNodes.src.value,
                                        trc : ($scope.selectedNodes.trc != null && parseInt($scope.selectedNodes.trc.value) > 0) ? $scope.selectedNodes.trc.value : null
                                    },
                                    scheme : schemeId,
                                    spec : $scope.section.spec
                                };
                                section.spec.type = $scope.selectedSectionType.value;
                                section.spec.status = (section.spec.status != null && section.spec.status == true) ? "on" : "off";
                                                            
                                $http.post(urlPostSection, JSON.stringify(section)).then((res) => {
		                            // success
			                        if(res.status == 201){
			                            Flash.create('success', '<strong>Well done!</strong> You successfully created new section.');
			                            $location.path('/elements/' + schemeId + '/sections');
			                        } else {
				                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                        console.log('[FAIL] Elements/SectionCtrl.submit()/postNewSection/success');
				                        $location.path('/elements/' + schemeId + '/sections');
			                        }
		                        }, (res) => {
		                            // fail
		                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Elements/SectionCtrl.submit()/postNewSection/fail');
		                            $location.path('/elements/' + schemeId + '/sections');
		                        });
                            } else {
                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Elements/SectionCtrl.submit()/postSection/fail');
		                        $location.path('/elements/' + schemeId + '/sections');
                            }
	                    } else{
	                        Flash.create('info', '<strong>Notice!</strong> You don\'t have W permission to access this scheme.');
		                    console.log('[NOTICE]  Elements/SectionCtrl.submit()/getPermission/success');
		                    $location.path('/elements/scheme');
	                    }
			        } else if(res != null && res.status == 204){
			            Flash.create('info', '<strong>Notice!</strong> You don\'t have W permission to access this scheme.');
		                console.log('[NOTICE]  Elements/SectionCtrl.submit()/getPermission/success');
		                $location.path('/elements/scheme');
			        } else{
			            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                console.log('[FAIL]  Elements/SectionCtrl.submit()/getPermission/success');
		                $location.path('/elements/scheme');
			        }
		        }, (res) => {
		            // fail
		            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Elements/SectionCtrl.submit()/getPermission/fail');
		            $location.path('/elements/scheme');
		        });
            } else {
                Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		        console.log('[FAIL] Elements/SectionCtrl.submit()/schemeId/fail');
		        $location.path('/elements/scheme');
            }
        }
    };
    
    $scope.run();
    
}])

.controller('ObjectsCtrl', ['$scope', '$window', '$location', '$http', '$routeParams', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, $routeParams, Auth, Flash, Utils) {
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
    
    $scope.showSchematicMap = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $location.path('/maps/schematic/' + $routeParams.schemeId);
    };
    
    $scope.showScheme = function(what){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $location.path('/elements/' + $routeParams.schemeId + '/' + what);
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
		
		$location.path('/elements/' + $routeParams.schemeId + '/objects/' + 'new');
    };
    
    $scope.edit = function(objectId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$location.path('/elements/' + $routeParams.schemeId + '/objects/' + objectId);
    };
    
    $scope.delete = function(objectId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$http.delete(API_GW_URL + "objects/" + objectId).then((res) => {
		    // success
			if(res.status == 200){
				Flash.create('success', '<strong>Well done!</strong> You successfully removed object.');
			} else{
				Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				console.log('[FAIL] Elements/ObjectsCtrl.delete()/deleteObject/success');
			}
			$location.path('/elements/' + $routeParams.schemeId + '/objects');
			$scope.refresh();
		}, (res) => {
		    // fail
		    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Elements/ObjectsCtrl.delete()/deleteObject/fail');
		});
    };
    
    $scope.refresh = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.fetchObjects();
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
    
    $scope.fetchObjects = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.objects = [];
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
		                let urlObjects = API_GW_URL + "objects/?q=(schemeId=" + schemeId + ")&e=(object)&pageSize=" + $scope.paginator.size.value + "&pageNumber=" + $scope.paginator.page;
		                $http.get(urlObjects).then((res) => {
		                    // success
			                if(res != null && res.data != null && res.status == 200){
	                            for(var i = 0; i < res.data.items.length; i++){
	                                $scope.objects.push({
	                                    id : res.data.items[i]._meta.id,
	                                    name : res.data.items[i].name
	                                });
	                            }
	                            $scope.paginator.totalItems = res.data.itemsTotal;
	                            $scope.paginator.totalPages = res.data.pagesTotal;
	                            for(var i = 0; i < $scope.paginator.totalPages; i++){
	                                $scope.paginator.totalPagesArray.push(i + 1);
	                            }
			                } else if(res != null && res.status == 204){
			                    Flash.create('info', '<strong>Notice!</strong> Not found any object.');
		                        console.log('[NOTICE] Elements/ObjectsCtrl.fetchObjects()/getObjects/success');
			                } else{
			                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Elements/ObjectsCtrl.fetchObjects()/getObjects/success');
		                        $location.path('/elements/scheme');
			                }
		                }, (res) => {
		                    // fail
		                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                    console.log('[FAIL] Elements/ObjectsCtrl.fetchObjects()/getObjects/fail');
		                    $location.path('/elements/scheme');
		                });
		                
	                } else{
	                    Flash.create('info', '<strong>Notice!</strong> You don\'t have R permission to access this scheme.');
		                console.log('[NOTICE] Elements/ObjectsCtrl.fetchObjects()/getPermission/success');
		                $location.path('/elements/scheme');
	                }
			    } else if(res != null && res.status == 204){
			        Flash.create('info', '<strong>Notice!</strong> You don\'t have R permission to access this scheme.');
		            console.log('[NOTICE] Elements/ObjectsCtrl.fetchObjects()/getPermission/success');
		            $location.path('/elements/scheme');
			    } else{
			        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Elements/ObjectsCtrl.fetchObjects()/getPermission/success');
		            $location.path('/elements/scheme');
			    }
		    }, (res) => {
		        // fail
		        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Elements/ObjectsCtrl.fetchObjects()/getPermission/fail');
		        $location.path('/elements/scheme');
		    });
        } else {
            Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		    console.log('[FAIL] Elements/ObjectsCtrl.fetchObjects()/schemeId/fail');
		    $location.path('/elements/scheme');
        }
    };
    
    $scope.fetchObjects();
}])

.controller('ObjectCtrl', ['$scope', '$window', '$location', '$http', '$routeParams', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, $routeParams, Auth, Flash, Utils) {
        
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
		
        $location.path('/elements/' + $routeParams.schemeId + '/objects');
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
		
		$scope.objectBoxTitle = "";
		
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
	                    let objectId = $routeParams.objectId;
	                    if(parseInt(objectId) > 0){
		                    $http.get(API_GW_URL + "objects/" + objectId).then((res) => {
		                        // success
			                    if(res != null && res.data != null && res.status == 200){
	                                $scope.object = res.data;
	                                $scope.objectBoxTitle = objectId;
	                                $scope.userBoxTitle = "Update values of the object.";
			                    }  else{
			                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Elements/NodeCtrl.run()/getNode/success');
		                            $location.path('/elements/' + schemeId + '/objects');
			                    }
		                    }, (res) => {
		                        // fail
		                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Elements/NodeCtrl.run()/getNode/fail');
		                        $location.path('/elements/' + schemeId + '/objects');
		                    });
		                } else {
		                    $scope.object = {
		                        name : ""
		                    };
                            $scope.objectBoxTitle = "new";
                            $scope.userBoxTitle = "Fill values of a new object.";
		                }
	                } else{
	                    Flash.create('info', '<strong>Notice!</strong> You don\'t have RW permission to access this scheme.');
		                console.log('[NOTICE]  Elements/ObjectCtrl.run()/getPermission/success');
		                $location.path('/elements/scheme');
	                }
			    } else if(res != null && res.status == 204){
			        Flash.create('info', '<strong>Notice!</strong> You don\'t have RW permission to access this scheme.');
		            console.log('[NOTICE]  Elements/ObjectCtrl.run()/getPermission/success');
		            $location.path('/elements/scheme');
			    } else{
			        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL]  Elements/ObjectCtrl.run()/getPermission/success');
		            $location.path('/elements/scheme');
			    }
		    }, (res) => {
		        // fail
		        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Elements/ObjectCtrl.run()/getPermission/fail');
		        $location.path('/elements/scheme');
		    });
        } else {
            Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		    console.log('[FAIL] Elements/ObjectCtrl.run()/schemeId/fail');
		    $location.path('/elements/scheme');
        }
    };
    
    
    $scope.submit = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		if ($scope.objectForm.$valid){
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
	                        if(from <= now && to > now && isReadable && isWritable){
	                            hasPermission = true;
	                            break;
	                        }
	                    }
	                    
	                    if(hasPermission){
	                        let urlPostObject = API_GW_URL + "objects/",
	                            objectId = $routeParams.objectId;
                            if(parseInt(objectId) > 0){
                                urlPostObject = urlPostObject + objectId + "/";
                                $scope.object.scheme = schemeId; 
                                
                                $http.post(urlPostObject, JSON.stringify($scope.object)).then((res) => {
		                            // success
			                        if(res.status == 200){
			                            Flash.create('success', '<strong>Well done!</strong> You successfully updated object.');
			                            $location.path('/elements/' + schemeId + '/objects');
			                        } else {
				                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                        console.log('[FAIL] Elements/NodeCtrl.submit()/postObject/success');
				                        $location.path('/elements/' + schemeId + '/objects');
			                        }
		                        }, (res) => {
		                            // fail
		                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Elements/NodeCtrl.submit()/postObject/fail');
		                            $location.path('/elements/' + schemeId + '/objects');
		                        });
                            } else if(objectId == "new"){  
                                $scope.object.scheme = schemeId; 
                                $http.post(urlPostObject, JSON.stringify($scope.object)).then((res) => {
		                            // success
			                        if(res.status == 201){
			                            Flash.create('success', '<strong>Well done!</strong> You successfully created new object.');
			                            $location.path('/elements/' + schemeId + '/objects');
			                        } else {
				                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                        console.log('[FAIL] Elements/ObjectCtrl.submit()/postNewObject/success');
				                        $location.path('/elements/' + schemeId + '/objects');
			                        }
		                        }, (res) => {
		                            // fail
		                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Elements/ObjectCtrl.submit()/postNewObject/fail');
		                            $location.path('/elements/' + schemeId + '/objects');
		                        });
                            } else {
                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Elements/ObjectCtrl.submit()/postObject/fail');
		                        $location.path('/elements/' + schemeId + '/objects');
                            }
	                    } else{
	                        Flash.create('info', '<strong>Notice!</strong> You don\'t have W permission to access this scheme.');
		                    console.log('[NOTICE]  Elements/ObjectCtrl.submit()/getPermission/success');
		                    $location.path('/elements/scheme');
	                    }
			        } else if(res != null && res.status == 204){
			            Flash.create('info', '<strong>Notice!</strong> You don\'t have W permission to access this scheme.');
		                console.log('[NOTICE]  Elements/ObjectCtrl.submit()/getPermission/success');
		                $location.path('/elements/scheme');
			        } else{
			            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                console.log('[FAIL]  Elements/ObjectCtrl.submit()/getPermission/success');
		                $location.path('/elements/scheme');
			        }
		        }, (res) => {
		            // fail
		            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Elements/ObjectCtrl.submit()/getPermission/fail');
		            $location.path('/elements/scheme');
		        });
            } else {
                Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		        console.log('[FAIL] Elements/ObjectCtrl.submit()/schemeId/fail');
		        $location.path('/elements/scheme');
            }
        }
    };
    
    $scope.run();
    
}])

.controller('PointsCtrl', ['$scope', '$window', '$location', '$http', '$routeParams', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, $routeParams, Auth, Flash, Utils) {
    
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
    
    $scope.showSchematicMap = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $location.path('/maps/schematic/' + $routeParams.schemeId);
    };
    
    $scope.showScheme = function(what){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
        $location.path('/elements/' + $routeParams.schemeId + '/' + what);
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
		
		$location.path('/elements/' + $routeParams.schemeId + '/points/' + 'new');
    };
    
    $scope.edit = function(pointId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$location.path('/elements/' + $routeParams.schemeId + '/points/' + pointId);
    };
    
    $scope.delete = function(pointId){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$http.delete(API_GW_URL + "mapPoints/" + pointId).then((res) => {
		    // success
			if(res.status == 200){
				Flash.create('success', '<strong>Well done!</strong> You successfully removed point.');
			} else{
				Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				console.log('[FAIL] Elements/PointsCtrl.delete()/deletePoint/success');
			}
			$location.path('/elements/' + $routeParams.schemeId + '/points');
			$scope.refresh();
		}, (res) => {
		    // fail
		    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Elements/PointsCtrl.delete()/deletePoint/fail');
		});
    };
    
    $scope.refresh = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.fetchPoints();
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
    
    $scope.fetchPoints = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		$scope.points = [];
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
		                let urlPoints = API_GW_URL + "mapPoints/?q=(schemeId=" + schemeId + ")&e=(mapPoint)&pageSize=" + $scope.paginator.size.value + "&pageNumber=" + $scope.paginator.page;
		                $http.get(urlPoints).then((res) => {
		                    // success
			                if(res != null && res.data != null && res.status == 200){
	                            for(var i = 0; i < res.data.items.length; i++){
	                                $scope.points.push({
	                                    id : res.data.items[i]._meta.id,
	                                    x : res.data.items[i].x,
	                                    y : res.data.items[i].y,
	                                    gps : {
	                                        altitude : res.data.items[i].gps.altitude,
	                                        latitude : res.data.items[i].gps.latitude,
	                                        longitude : res.data.items[i].gps.longitude
	                                    }
	                                });
	                            }
	                            $scope.paginator.totalItems = res.data.itemsTotal;
	                            $scope.paginator.totalPages = res.data.pagesTotal;
	                            for(var i = 0; i < $scope.paginator.totalPages; i++){
	                                $scope.paginator.totalPagesArray.push(i + 1);
	                            }
			                } else if(res != null && res.status == 204){
			                    Flash.create('info', '<strong>Notice!</strong> Not found any point.');
		                        console.log('[NOTICE] Elements/PointsCtrl.fetchPoints()/getPoints/success');
			                } else{
			                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Elements/PointsCtrl.fetchPoints()/getPoints/success');
		                        $location.path('/elements/scheme');
			                }
		                }, (res) => {
		                    // fail
		                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                    console.log('[FAIL] Elements/PointsCtrl.fetchPoints()/getPoints/fail');
		                    $location.path('/elements/scheme');
		                });
		                
	                } else{
	                    Flash.create('info', '<strong>Notice!</strong> You don\'t have R permission to access this scheme.');
		                console.log('[NOTICE] Elements/PointsCtrl.fetchPoints()/getPermission/success');
		                $location.path('/elements/scheme');
	                }
			    } else if(res != null && res.status == 204){
			        Flash.create('info', '<strong>Notice!</strong> You don\'t have R permission to access this scheme.');
		            console.log('[NOTICE] Elements/PointsCtrl.fetchPoints()/getPermission/success');
		            $location.path('/elements/scheme');
			    } else{
			        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Elements/PointsCtrl.fetchPoints()/getPermission/success');
		            $location.path('/elements/scheme');
			    }
		    }, (res) => {
		        // fail
		        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Elements/PointsCtrl.fetchPoints()/getPermission/fail');
		        $location.path('/elements/scheme');
		    });
        } else {
            Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		    console.log('[FAIL] Elements/PointsCtrl.fetchPoints()/schemeId/fail');
		    $location.path('/elements/scheme');
        }
    };
    
    $scope.fetchPoints();
}])

.controller('PointCtrl', ['$scope', '$window', '$location', '$http', '$routeParams', 'Auth', 'Flash', 'Utils', function($scope, $window, $location, $http, $routeParams, Auth, Flash, Utils) {
    
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
		
        $location.path('/elements/' + $routeParams.schemeId + '/points');
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
		
		$scope.pointBoxTitle = "";
		
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
	                    let pointId = $routeParams.pointId;
	                    if(parseInt(pointId) > 0){
		                    $http.get(API_GW_URL + "mapPoints/" + pointId).then((res) => {
		                        // success
			                    if(res != null && res.data != null && res.status == 200){
	                                $scope.point = res.data;
	                                $scope.pointBoxTitle = pointId;
	                                $scope.userBoxTitle = "Update values of the point.";
			                    }  else{
			                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Elements/PointCtrl.run()/getPoint/success');
		                            $location.path('/elements/' + schemeId + '/points');
			                    }
		                    }, (res) => {
		                        // fail
		                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Elements/PointCtrl.run()/getPoint/fail');
		                        $location.path('/elements/' + schemeId + '/points');
		                    });
		                } else {
		                    $scope.point = {
		                        x : 0,
		                        y : 0,
		                        gps : {
		                            altitude : "",
		                            latitude : "",
		                            longitude : ""
		                        }
		                    };
                            $scope.pointBoxTitle = "new";
                            $scope.userBoxTitle = "Fill values of a new point.";
		                }
	                } else{
	                    Flash.create('info', '<strong>Notice!</strong> You don\'t have RW permission to access this scheme.');
		                console.log('[NOTICE]  Elements/PointCtrl.run()/getPermission/success');
		                $location.path('/elements/scheme');
	                }
			    } else if(res != null && res.status == 204){
			        Flash.create('info', '<strong>Notice!</strong> You don\'t have RW permission to access this scheme.');
		            console.log('[NOTICE]  Elements/PointCtrl.run()/getPermission/success');
		            $location.path('/elements/scheme');
			    } else{
			        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL]  Elements/PointCtrl.run()/getPermission/success');
		            $location.path('/elements/scheme');
			    }
		    }, (res) => {
		        // fail
		        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Elements/PointCtrl.run()/getPermission/fail');
		        $location.path('/elements/scheme');
		    });
        } else {
            Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		    console.log('[FAIL] Elements/PointCtrl.run()/schemeId/fail');
		    $location.path('/elements/scheme');
        }
    };
    
    
    $scope.submit = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		if ($scope.pointForm.$valid){
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
	                        if(from <= now && to > now && isReadable && isWritable){
	                            hasPermission = true;
	                            break;
	                        }
	                    }
	                    
	                    if(hasPermission){
	                        let urlPostPoint = API_GW_URL + "mapPoints/",
	                            pointId = $routeParams.pointId;
                            if(parseInt(pointId) > 0){
                                urlPostPoint = urlPostPoint + pointId + "/";
                                $scope.point.scheme = schemeId; 
                                
                                $http.post(urlPostPoint, JSON.stringify($scope.point)).then((res) => {
		                            // success
			                        if(res.status == 200){
			                            Flash.create('success', '<strong>Well done!</strong> You successfully updated point.');
			                            $location.path('/elements/' + schemeId + '/points');
			                        } else {
				                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                        console.log('[FAIL] Elements/PointCtrl.submit()/postPoint/success');
				                        $location.path('/elements/' + schemeId + '/points');
			                        }
		                        }, (res) => {
		                            // fail
		                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Elements/PointCtrl.submit()/postPoint/fail');
		                            $location.path('/elements/' + schemeId + '/points');
		                        });
                            } else if(pointId == "new"){  
                                $scope.point.scheme = schemeId; 
                                $http.post(urlPostPoint, JSON.stringify($scope.point)).then((res) => {
		                            // success
			                        if(res.status == 201){
			                            Flash.create('success', '<strong>Well done!</strong> You successfully created new point.');
			                            $location.path('/elements/' + schemeId + '/points');
			                        } else {
				                        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
				                        console.log('[FAIL] Elements/PointCtrl.submit()/postNewPoint/success');
				                        $location.path('/elements/' + schemeId + '/points');
			                        }
		                        }, (res) => {
		                            // fail
		                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Elements/PointCtrl.submit()/postNewPoint/fail');
		                            $location.path('/elements/' + schemeId + '/points');
		                        });
                            } else {
                                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Elements/PointCtrl.submit()/postPoint/fail');
		                        $location.path('/elements/' + schemeId + '/points');
                            }
	                    } else{
	                        Flash.create('info', '<strong>Notice!</strong> You don\'t have W permission to access this scheme.');
		                    console.log('[NOTICE]  Elements/PointCtrl.submit()/getPermission/success');
		                    $location.path('/elements/scheme');
	                    }
			        } else if(res != null && res.status == 204){
			            Flash.create('info', '<strong>Notice!</strong> You don\'t have W permission to access this scheme.');
		                console.log('[NOTICE]  Elements/PointCtrl.submit()/getPermission/success');
		                $location.path('/elements/scheme');
			        } else{
			            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                console.log('[FAIL]  Elements/PointCtrl.submit()/getPermission/success');
		                $location.path('/elements/scheme');
			        }
		        }, (res) => {
		            // fail
		            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Elements/PointCtrl.submit()/getPermission/fail');
		            $location.path('/elements/scheme');
		        });
            } else {
                Flash.create('danger', '<strong>Oooops!</strong> Incorrect scheme id. Try it again.');
		        console.log('[FAIL] Elements/PointCtrl.submit()/schemeId/fail');
		        $location.path('/elements/scheme');
            }
        }
    };
    
    $scope.run();
    
}]);
