// Ionic Grandbrag App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'grandbrag' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'grandbrag.services' is found in services.js
// 'grndbrag.controllers' is found in controllers.js
angular.module('grandbrag', [
  'ionic',
  'grandbrag.controllers',
  'grandbrag.directives',
  'grandbrag.services',
  'firebase',
  'ngCordova'
])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  })


})

.config(function($compileProvider, $stateProvider, $urlRouterProvider, $httpProvider) {


  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js

   $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|data):/);

  $stateProvider


  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: 'LoginCtrl'
  })

  .state('menu', {
    url: "/menu",
    templateUrl: "templates/menu.html",
    data: {
      requiresLogin: true
    },
	abstract:true,
	controller: 'MenuCtrl'
  })
  .state('menu.mystream', {
      url: "/mystream",
      views: {
        'menuContent' :{
          templateUrl: "templates/mystream.html",
          controller: 'MystreamCtrl'

        }
      }
    })

	.state('menu.myprofile', {
      url: "/myprofile",
      views: {
        'menuContent' :{
          templateUrl: "templates/myprofile.html",
          controller: 'MyprofileCtrl'
        }
      }
    })
	.state('menu.mygrandchildren', {
      url: "/mygrandchildren",
      views: {
        'menuContent' :{
          templateUrl: "templates/mygrandchildren.html",
          controller: 'MygrandchildrenCtrl'
        }
      }
    })
	.state('menu.myfriends', {
      url: "/myfriends",
      views: {
        'menuContent' :{
          templateUrl: "templates/myfriends.html",
          controller: 'MyfriendsCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('login');

})
