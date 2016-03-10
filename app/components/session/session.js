'use strict';

const CLIENT_ID = "editorV1";
const STATE_LENGTH = 32;
const API_GW_URL = "https://api.cpdn.sd2.cz/v1/";
const AUTHENTICATION_ENDPOINT_URL = "https://idp.cpdn.sd2.cz/authentication";
const OAUTH_TOKEN_ENDPOINT_URL = "https://idp.cpdn.sd2.cz/token";

angular.module('cpdnEditor.session', ['ngRoute'])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'components/session/login.html',
    controller: 'LoginCtrl'
  });
  $routeProvider.when('/logout', {
    templateUrl: 'components/session/logout.html',
    controller: 'LogoutCtrl'
  });
  $routeProvider.when('/session', {
    templateUrl: 'components/session/oauth-response.html',
    controller: 'OAuthResponseCtrl'
  }); 
}])

.controller('LoginCtrl', ['$scope', '$window', 'Auth', 'Flash', 'Utils', function($scope, $window, Auth, Flash, Utils) {
    $scope.go = function(){
        let state = Utils.randomString(STATE_LENGTH);
        localStorage.setItem('state', state);
        
        let url = AUTHENTICATION_ENDPOINT_URL + "?response_type=code&client_id=" + CLIENT_ID + "&state=" + state;
        $window.open(url, "_self");
    };
}])

.controller('OAuthResponseCtrl', ['$scope', '$location', '$window', '$http', 'Auth', 'Flash', 'Utils', function($scope, $location, $window, $http, Auth, Flash, Utils) {
    let authorizePattern = new RegExp("code=([a-zA-Z0-9]{40})", 'g'),
        statePattern = new RegExp("state=([a-zA-Z0-9]{" + STATE_LENGTH + "})", 'g'),
        rxAuthorizeToken = authorizePattern.exec($window.location.href),
        rxState = statePattern.exec($window.location.href),
        originState = localStorage.getItem('state');
    
    localStorage.setItem('state', null);
    
    if(rxAuthorizeToken != null && rxAuthorizeToken[1] != null && rxState != null && rxState[1] != null){
        let authorizeToken = rxAuthorizeToken[1],
            state = rxState[1];
        
        if(state != null && originState != null && state === originState){
            $http.post(OAUTH_TOKEN_ENDPOINT_URL, JSON.stringify({
                    client_id : CLIENT_ID,
                    grant_type : "authorization_code",
                    code : authorizeToken
                })).then((res) => {
		        // success
		        if(res != null && res.data != null && res.status == 200){
		            let oauth = res.data,
		                config = {
		                method : "GET",
		                url : API_GW_URL + "users/my",
		                headers : {
		                    Authorization : 'Bearer ' + oauth.access_token
		                }
		            };
		            $http(config).then((res) => {
		                // success
			            if(res != null && res.data != null && res.status == 200){
	                        Auth.setOAuth(oauth.access_token, oauth.expires_in, oauth.refresh_token);
	                        Auth.setUser(res.data._meta.id, res.data.nick, res.data.contact.firstname, res.data.contact.surname, res.data.contact.phone, res.data.contact.email);
	                        $window.open("#/home", "_self");
			            } else{
			                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                    console.log('[FAIL] Session/OAuthResponseCtrl/getUser/success');
		                    Auth.logout(()=>{
	                            $location.path("/login");
                            });
			            }
		            }, (res) => {
		                // fail
		                Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		                console.log('[FAIL] Session/OAuthResponseCtrl/getUser/fail');
		                Auth.logout(()=>{
	                        $location.path("/login");
                        });
		            });
		            
			    } else {
			        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
			        console.log('[FAIL] Session/OAuthResponseCtrl/getAccessToken/success');
			        $location.path("/login");
			    }
		    }, (res) => {
		        // fail
		        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		        console.log('[FAIL] Session/OAuthResponseCtrl/getAccessToken/fail');
		        $location.path("/login");
		    });
        } else {
            Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		    console.log('[FAIL] Session/OAuthResponseCtrl/invalidResponseState');
		    $location.path("/login");
        }
    } else{
        Flash.create('danger', '<strong>Oooops!</strong> Some error occurred. Try it again.');
		console.log('[FAIL] Session/OAuthResponseCtrl/invalidResponseTokensParsing');
		$window.open("#/login", "_self");
    }
    
}])

.controller('LogoutCtrl', ['$scope', 'Auth', function($scope, Auth) {
    Auth.logout(()=>{});
}]);
