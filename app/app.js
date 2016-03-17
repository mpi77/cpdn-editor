'use strict';

import 'jquery';
import 'bootstrap';
import 'angular';
import 'angular-route';
import 'angular-animate';
import 'angular-flash-alert';
import 'angular-loading-bar';
import 'vis';

import './services/auth.js';
import './services/utils.js';
import './services/schematic-map.js';
import './directives/angular-vis.js';
import './components/home/home.js';
import './components/navbar/navbar.js';

import './components/calculations/calculations.js';
import './components/elements/elements.js';
import './components/maps/maps.js';
import './components/permissions/permissions.js';
import './components/users/users.js';
import './components/schemes/schemes.js';
import './components/session/session.js';

angular.module('cpdnEditor', [
  'ngRoute',
  'ngAnimate',
  'ngFlash',
  'ngVis',
  'angular-loading-bar',
  'cpdnEditor.auth',
  'cpdnEditor.utils',
  'cpdnEditor.session',
  'cpdnEditor.navbar',
  'cpdnEditor.home',
  'cpdnEditor.schemes',
  'cpdnEditor.calculations',
  'cpdnEditor.elements',
  'cpdnEditor.maps',
  'cpdnEditor.maps.services',
  'cpdnEditor.permissions',
  'cpdnEditor.users'  
])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.otherwise({redirectTo: '/home'});
}]);

