'use strict';

class Auth {
  constructor() {
    let oauth = JSON.parse(localStorage.getItem('oauth')),
        user = JSON.parse(localStorage.getItem('user'));
    
    if(oauth != undefined && oauth != null){
      this.oauth = oauth;
    } else {
      this.oauth = null;
      localStorage.setItem('oauth', null);
    }
    
    if(user != undefined && user != null){
      this.user = user;
    } else {
      this.user = null;
      localStorage.setItem('user', null);
    }
  }

  isAuth() {
    if(this.oauth != undefined && this.oauth != null){
        return !!this.oauth.accessToken;
    } else {
        return false;
    }
  }

  getUser() {
    return this.user;
  }
  
  getOAuth() {
    return this.oauth;
  }
  
  setUser(id, nick, firstname, surname, phone, email){
    this.user = {
        id : id,
        nick : nick,
        firstname : firstname,
        surname : surname,
        phone : phone,
        email : email
    };
    localStorage.setItem('user', JSON.stringify(this.user));
  }
  
  setOAuth(accessToken, validTo, refreshToken){
    this.oauth = {
        accessToken : accessToken,
        refreshToken : refreshToken,
        validTo : validTo
    };
    localStorage.setItem('oauth', JSON.stringify(this.oauth));
  }
  
  logout(successCallback) {
    localStorage.removeItem('oauth');
    localStorage.removeItem('user');
    this.oauth = null;
    this.user = null;
    successCallback();
  }
}

class AuthInterceptor {
    
    /* ngInject */
    constructor($q, $location) {
        this.$q = $q;
        this.$location = $location;
    }
    
    request(config) {
        let oauth = JSON.parse(localStorage.getItem('oauth'));
    	if (oauth != undefined && oauth != null) {
    	    if(oauth.accessToken != undefined && oauth.accessToken != null){
    		    config.headers.Authorization = 'Bearer ' + oauth.accessToken;
    		}
    	}
    	return config;
    }
  
    responseError(rejection){
    	if(rejection.status == 401 || rejection.status == 403) {
    		$location.path('/login');
    	}
    	console.log(rejection);
    	return(rejection);
    }
}

config.$inject = ['$httpProvider'];

function config($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
}

export default angular.module('cpdnEditor.auth', [])
  .service('Auth', Auth)
  .service('authInterceptor', AuthInterceptor)
  .config(config)
  .name;
