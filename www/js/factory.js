angular.module('appFactory', [])

.factory('FBURL', function($firebaseAuth) {
  var usersRef = new Firebase('https://ngboston.firebaseio.com/');
  var data = {
    auth: $firebaseAuth(usersRef),
    db: usersRef
  }
  return data;
})

.factory('Users', function($firebaseObject) {
  var drawerRef = new Firebase('https://ngboston.firebaseio.com/drawers');
  return $firebaseObject(drawerRef);
})
