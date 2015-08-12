angular.module('appFactory', [])

.factory('FBURL', function($firebaseAuth) {
  var usersRef = new Firebase('https://ngboston.firebaseio.com/');
  var data = {
    auth: $firebaseAuth(usersRef),
    db: usersRef
  }
  return data;
})
