'use strict';

const API_GW_URL = "https://api.cpdn.sd2.cz/v1/";
const PAGE_SIZE = 250;

angular.module('cpdnEditor.maps', ['ngRoute'])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/maps/scheme', {
    templateUrl: 'components/maps/select-scheme.html',
    controller: 'MapsSelectSchemeCtrl'
  });
  $routeProvider.when('/maps/schematic/:schemeId', {
    templateUrl: 'components/maps/schematic.html',
    controller: 'SchematicCtrl'
  });
}])

.controller('SchematicCtrl', ['$scope', '$window', '$http', '$routeParams', '$location', 'VisDataSet', 'SchematicMap', 'Auth', 'Flash', 'Utils', function($scope, $window, $http, $routeParams, $location, VisDataSet, SchematicMap, Auth, Flash, Utils) {

    $scope.schematicConfig = {
        enabledColors : false
    };
    
    $scope.events = {};
    
    $scope.events.doubleClick = function(params) {
        if(!Auth.isAuth()){
		    $window.open('#/login', "_self");
		}
		
		let schemeId = $routeParams.schemeId;
        if(params.nodes && params.nodes.length > 0){            
            let nodeId = params.nodes[0].match(/^(N_)([1-9][0-9]{0,9})$/);
            if(nodeId != null && nodeId[2]>0){
                $window.open('#/elements/' + schemeId + '/nodes/' + nodeId[2], "_self");
            }
            
            let sectionId = params.nodes[0].match(/^(SN_(R|S|T|T3)_)([1-9][0-9]{0,9})$/);
            if(sectionId != null && sectionId[3]>0){
                $window.open('#/elements/' + schemeId + '/sections/' + sectionId[3], "_self");
            }
        } else if(params.nodes && params.edges && params.nodes.length == 0 && params.edges.length > 0){
            let sectionLineId = params.edges[0].match(/^(E_)([1-9][0-9]{0,9})$/);
            if(sectionLineId != null && sectionLineId[2]>0){
                $window.open('#/elements/' + schemeId + '/sections/' + sectionLineId[2], "_self");
            }
            
            let sectionId = params.edges[0].match(/^(SE_(SRC|DST|TRC|F|T)_)([1-9][0-9]{0,9})$/);
            if(sectionId != null && sectionId[3]>0){
                $window.open('#/elements/' + schemeId + '/sections/' + sectionId[3], "_self");
            }
        }
    }
    
    $scope.open = function(what){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		let url = "";
		
		if(what == "points" || what == "nodes" || what == "sections" || what == "objects"){
		    url = "#/elements/" + $routeParams.schemeId + "/" + what;
		}
        
        if(what == "permissions"){
		    url = "#/permissions/" + $routeParams.schemeId;
		}
		
		$window.open(url, "_self");
    };
    
    $scope.refresh = function(){
        if(!Auth.isAuth()){
		    $window.open('#/login', "_self");
		}
		
		$scope.draw();
    };
    
    $scope.setColors = function(){
        if(!Auth.isAuth()){
		    $window.open('#/login', "_self");
		}
		
		$scope.schematicConfig.enabledColors = !$scope.schematicConfig.enabledColors;
		$scope.draw();
    };
    
    $scope.draw = function(){
        if(!Auth.isAuth()){
		    $window.open('#/login', "_self");
		}
		
		$scope.data = {edges: [], nodes : []};
		
        $scope.options = {
            autoResize: true,
            height: '100%',
            width: '100%',
            physics:false,
            edges: {
                "smooth" : false
            },
            interaction: {
                navigationButtons: true,
                keyboard: true
            },
            manipulation: {
                enabled: false,
                initiallyActive: false,
                addNode: true,
                addEdge: true,
                editNode: function(){},
                editEdge: true,
                deleteNode: true,
                deleteEdge: true
            }
        };
        
		let xn = [], xs = [];
		
		let profile = Auth.getUser(),
		    schemeId = $routeParams.schemeId, 
		    urlCheckPermission = API_GW_URL + "permissions?q=(profileId=" + profile.id + ";schemeId="+schemeId+")&e=(permission,permission.scheme)&pageSize=10";
		
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
	                        hasPermission = true;
	                        break;
	                    }
	                }
	                
	                if(hasPermission){
	                    // SCHEME
		                $http.get(API_GW_URL + "schemes/" + schemeId)
		                .then((res) => {
		                    // success
			                if(res != null && res.data != null && res.status == 200){
			                    $scope.scheme = res.data;
			                    $scope.scheme.lock = (parseInt($scope.scheme.lock) == 1) ? true : false;
			                    
			                    // NODES
			                    $scope.nodes = null;
			                    $http.get(API_GW_URL + "schemes/" + schemeId + "/nodes?e=(node,node.calc,node.spec,node.mapPoint)&pageSize=" + PAGE_SIZE)
		                        .then((res) => {
		                            // success
			                        if(res != null && res.data != null && res.status == 200){
			                            if(res.data.itemsTotal > res.data.pageSize){
			                                console.log("need to fetch more nodes");
			                            }
			                            let nodes = res.data.items;
			                            //$scope.data = {edges: [], nodes : []};
			                            for(var i = 0; i < nodes.length; i++){
			                                let color = null, 
			                                    tooltipPanelColor = "", 
			                                    voltageCalc = parseInt(nodes[i].calc.voltage.value),
			                                    voltageSpec = parseInt(nodes[i].spec.voltage.level);		             
			                                if($scope.schematicConfig.enabledColors){
			                                    if(voltageCalc == voltageSpec){
			                                        color = SchematicMap.COLOR_OK;
			                                        tooltipPanelColor = "panel-success";
			                                    } else if(Math.abs(voltageCalc - voltageSpec) <= (voltageSpec * 0.05)){
			                                        color = SchematicMap.COLOR_TOLERANCE;
			                                        tooltipPanelColor = "panel-warning";
			                                    } else {
			                                        color = SchematicMap.COLOR_FAULT;
			                                        tooltipPanelColor = "panel-danger";
			                                    }
			                                }
			                                
			                                xn.push(
			                                    SchematicMap.createNode({
			                                        type : nodes[i].spec.type, 
			                                        id : nodes[i]._meta.id, 
			                                        label : (nodes[i].spec.label != null) ? nodes[i].spec.label : "N_" + nodes[i]._meta.id, 
			                                        x : nodes[i].mapPoint.x, 
			                                        y : nodes[i].mapPoint.y,
			                                        color : color ,
			                                        title : {
			                                            id : nodes[i]._meta.id, 
			                                            label : (nodes[i].spec.label != null) ? nodes[i].spec.label : "N_" + nodes[i]._meta.id, 
                                                        voltageCalc : voltageCalc,
                                                        voltageSpec : voltageSpec,
                                                        enabledColors : $scope.schematicConfig.enabledColors,
                                                        panelColor : tooltipPanelColor
                                                    }
			                                    })
			                                );
			                            }
			                            
			                            // SECTIONS
			                            $scope.sections = null;
			                            $http.get(API_GW_URL + "schemes/" + schemeId + "/sections?e=(section,section.calc,section.spec,section.nodes)&pageSize=" + PAGE_SIZE)
		                                .then((res) => {
		                                    // success
			                                if(res != null && res.data != null && res.status == 200){
			                                    if(res.data.itemsTotal > res.data.pageSize){
			                                        console.log("need to fetch more sections");
			                                    }
			                                    let sections = res.data.items;
			                                    for(var i = 0; i < sections.length; i++){
			                                        let color = null, 
			                                            tooltipPanelColor = "", 
			                                            maxCurrent = parseInt(sections[i].spec.current.max),
			                                            srcCurrent = parseInt(sections[i].calc.current.src.value),
			                                            dstCurrent = parseInt(sections[i].calc.current.dst.value);     
			                                        if($scope.schematicConfig.enabledColors){
			                                            if( srcCurrent <= maxCurrent && dstCurrent <= maxCurrent){
			                                                color = SchematicMap.COLOR_OK;
			                                                tooltipPanelColor = "panel-success";
			                                            } else {
			                                                color = SchematicMap.COLOR_FAULT;
			                                                tooltipPanelColor = "panel-danger";
			                                            }
			                                        }
			                                        
			                                        let fromId = sections[i].nodes.src._meta.id;
			                                        let toId = sections[i].nodes.dst._meta.id;
			                                        let from = null, to = null;
			                                        for(var j = 0; j<xn.length; j++){
			                                            if(from == null){
			                                                from = (xn[j].id == "N_" + fromId) ? {x : xn[j].x, y : xn[j].y} : null;
			                                            }
			                                            if(to == null){
			                                                to = (xn[j].id == "N_" + toId) ? {x : xn[j].x, y : xn[j].y} : null;
			                                            }
			                                            if(from != null && to != null){
			                                                break;
			                                            }
			                                        }
			                                        let coords = SchematicMap.getRectangleCenter(parseInt(from.x),parseInt(from.y),parseInt(to.x),parseInt(to.y));
			                                        
			                                        let t = SchematicMap.createSection({
                                                            type : sections[i].spec.type, 
                                                            id : sections[i]._meta.id, 
                                                            from : "N_" + fromId, 
                                                            to : "N_" + toId, 
                                                            toTrc : (sections[i].nodes.trc != null ? "N_" + sections[i].nodes.trc._meta.id : null), 
                                                            x : coords.x, 
                                                            y : coords.y,
                                                            label : (sections[i].spec.label != null) ? sections[i].spec.label : "E_" + sections[i]._meta.id,
                                                            color : color,
                                                            title : {
			                                                    id : sections[i]._meta.id, 
			                                                    label : (sections[i].spec.label != null) ? sections[i].spec.label : "E_" + sections[i]._meta.id, 
                                                                currentMax : maxCurrent,
                                                                currentSrc : srcCurrent,
                                                                currentDst : dstCurrent,
                                                                enabledColors : $scope.schematicConfig.enabledColors,
                                                                panelColor : tooltipPanelColor
                                                            }
                                                    });
                                                    
                                                    xn = xn.concat(t.nodes);  
			                                        xs = xs.concat(t.edges);
			                                    }
			                                } else if(res != null && res.status == 204){
			                                    Flash.create('info', '<strong>Notice!</strong> Not found any section in scheme.');
		                                        console.log('[FAIL] Maps/SchematicCtrl.draw()/getSections/success');
			                                } else{
			                                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                        console.log('[FAIL] Maps/SchematicCtrl.draw()/getSections/success');
			                                }
			                                $scope.data = {edges: $scope.data.edges.concat(xs) , nodes : $scope.data.nodes.concat(xn)};
		                                }, (res) => {
		                                    // fail
		                                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                    console.log('[FAIL] Maps/SchematicCtrl.draw()/getSections/fail');
		                                });
			                        } else if(res != null && res.status == 204){
			                            Flash.create('info', '<strong>Notice!</strong> Not found any node in scheme.');
		                                console.log('[FAIL] Maps/SchematicCtrl.draw()/getNodes/success');
			                        } else{
			                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                                console.log('[FAIL] Maps/SchematicCtrl.draw()/getNodes/success');
			                        }
		                        }, (res) => {
		                            // fail
		                            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                            console.log('[FAIL] Maps/SchematicCtrl.draw()/getNodes/fail');
		                        });
			                } else {
			                    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                        console.log('[FAIL] Maps/SchematicCtrl.draw()/getScheme/success');
			                }
		                }, (res) => {
		                    // fail
		                    $scope.scheme = null;
		                    Flash.create('danger', '<strong>Oooops!</strong> Scheme was not found or some error occurred. Try it again.');
		                    console.log('[FAIL] Maps/SchematicCtrl.draw()/getScheme/fail');
		                });
	                } else{
	                    Flash.create('info', '<strong>Notice!</strong> You don\'t have R permission to access this scheme.');
		                console.log('[NOTICE] Maps/SchematicCtrl.draw()/getPermission/success');
		                $window.open('#/maps/scheme', "_self");
	                }
			    } else if(res != null && res.status == 204){
			        Flash.create('info', '<strong>Notice!</strong> You don\'t have R permission to access this scheme.');
		            console.log('[NOTICE] Maps/SchematicCtrl.draw()/getPermission/success');
		            $window.open('#/maps/scheme', "_self");
			    } else{
			        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		            console.log('[FAIL] Maps/SchematicCtrl.draw()/getPermission/success');
		            $window.open('#/maps/scheme', "_self");
			    }
		    }, (res) => {
		        // fail
		        Flash.create('warning', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Maps/SchematicCtrl.draw()/getPermission/fail');
		        $window.open('#/maps/scheme', "_self");
		    }
		);
	};	
	
    $scope.draw();
    
}])

.controller('MapsSelectSchemeCtrl', ['$scope', '$http', '$window', '$location', 'Auth', 'Utils', 'Flash', function($scope, $http, $window, $location, Auth, Utils, Flash) {
    $scope.viewScheme = function(){
        if(!Auth.isAuth()){
		    $location.path('/login');
		}
		
		if($scope.selectedScheme && $scope.selectedScheme.id > 0){
		    $location.path('/maps/schematic/' + $scope.selectedScheme.id);
		}
    };
    
    $scope.back = function(){
        if(!Auth.isAuth()){
		    $window.open('#/login', "_self");
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
		        console.log('[FAIL] Maps/SelectSchemeCtrl.fetchSchemes()/getScheme/success');
			} else{
			    Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Maps/SelectSchemeCtrl.fetchSchemes()/getScheme/success');
			}
		}, (res) => {
		    // fail
		    $scope.schemes = null;
		    Flash.create('warning', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Maps/SelectSchemeCtrl.fetchSchemes()/getScheme/fail');
		});
    };
    
    $scope.fetchSchemes();
  
}])

.controller('SchematicNavbarCtrl', ['$scope', '$window', '$location', '$http', 'VisDataSet', 'Auth', function($scope, $window, $location, $http, VisDataSet, Auth) {
    $scope.back = function(){
        if(!Auth.isAuth()){
		    $window.open('#/login', "_self");
		}
		
        $location.path('/maps/scheme');
    };
  
}]);
