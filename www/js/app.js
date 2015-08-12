// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase', 'drawCanvas', 'appFactory'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('AppCtrl', function($ionicScrollDelegate, $scope, FBURL, $ionicModal, $timeout, $ionicSideMenuDelegate, Users) {
  //Auth

  $scope.users = Users;

  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.login = function(authMethod) {
    FBURL.auth.$authWithOAuthPopup(authMethod).then(function(authData) {
      console.log(authData);
      $scope.modal.hide();
    });
  };

  FBURL.auth.$onAuth(function(authData) {
    if (authData === null) {
      console.log('Not logged in yet');
    } else {
      console.log('Logged in as', authData.uid);
      $scope.users[authData.uid] = authData;
      $scope.users.$save();
      $ionicScrollDelegate.resize();

    }
    $scope.authData = authData; // This will display the user's name in our view
  });

});
