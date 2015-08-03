// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase'])

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
  // .constant('FBURL', 'https://ionic-auth-demo.firebaseio.com/')

.factory('FBURL', function($firebaseAuth) {
  var usersRef = new Firebase('https://ionic-auth-demo.firebaseio.com/');
  var data = {
    auth: $firebaseAuth(usersRef),
    db: usersRef
  }
  return data;
})

.controller('AppCtrl', function($ionicScrollDelegate, $scope, FBURL, $ionicModal, $timeout) {
  // GAME PRESENCE
  // var playingState = { Drawing: 0, Guessing: 1 };
  // watch for drawer's state
  var ref = FBURL.db;
  // var ref = new Firebase(FBURL);
  var pixelDataRef = ref.child('canvas');
  var drawerRef = ref.child('drawer/online');
  var guessersRef = ref.child('guessers/online');
  assignDrawer();

  //TODO(): User Logic
  function assignDrawer() {
    drawerRef.transaction(function(onlineVal) {
      if (onlineVal === null) {
        return true;
      } else {
        assignGuesser();
      }
    }, function(error, committed) {
      if (committed) {
        // we're the drawer
        $scope.drawer = true;
        console.log('drawer');
      } else {}
    });
  };

  function assignGuesser() {
    guessersRef.authAnonymously(function(error, authData) {
      if (error) {
        console.log(error);
      } else {
        var guesserOnlineRef = guessersRef.child(authData.uid);
        guesserOnlineRef.set(true);
        guesserOnlineRef.onDisconnect().remove();
      }
    });
  };

  drawerRef.onDisconnect().remove();


  // DRAWING CANVAS
  //Set up some globals
  var pixSize = 8,
    lastPoint = null,
    currentColor = "000",
    mouseDown = 0;
  // Set up our canvas
  var myCanvas = document.getElementById('drawing-canvas');
  var myContext = myCanvas.getContext ? myCanvas.getContext('2d') : null;
  if (myContext == null) {
    alert("You must use a browser that supports HTML5 Canvas to run this demo.");
    return;
  }
  //Setup each color palette & add it to the screen
  var colors = ["fff", "000", "f00", "0f0", "00f", "88f", "f8d", "f88", "f05", "f80", "0f8", "cf0"];
  for (c in colors) {
    var item = $('<div/>').css("backgroundColor", '#' + colors[c]).addClass("colorbox");
    item.click((function(e) {
      var col = colors[c];
      return function() {
        currentColor = col;
        $('.colorbox').removeClass("active");
        $(this).addClass("active");
      };
    })());
    item.appendTo('#colorholder');
  }

  //Keep track of if the mouse is up or down
  myCanvas.onmousedown = function() {
    mouseDown = 1;
  };
  myCanvas.onmouseup = function() {
    mouseDown = 0;
    lastPoint = null;
  };

  //Set the active color
  $('.colorbox[style="background-color: rgb(0, 0, 0);"]').addClass("active");
  //Draw a line from the mouse's last position to its current position


  //Draw a line from the mouse's last position to its current position
  var drawLineOnMouseMove = function(e) {
    if (!mouseDown) return;
    e.preventDefault();

    // Bresenham's line algorithm. We use this to ensure smooth lines are drawn
    var offset = $('canvas').offset();
    var x1 = Math.floor((e.pageX - offset.left) / pixSize - 1);
    var y1 = Math.floor((e.pageY - offset.top) / pixSize - 1);
    var x0 = (lastPoint == null) ? x1 : lastPoint[0];
    var y0 = (lastPoint == null) ? y1 : lastPoint[1];
    var dx = Math.abs(x1 - x0);
    var dy = Math.abs(y1 - y0);
    var sx = (x0 < x1) ? 1 : -1;
    var sy = (y0 < y1) ? 1 : -1;
    var err = dx - dy;
    while (true) {
      pixelDataRef.child(x0 + ":" + y0).set(currentColor === "fff" ? null : currentColor);

      if (x0 == x1 && y0 == y1) return;
      var e2 = 2 * err;
      if (e2 > -dy) {
        err = err - dy;
        x0 = x0 + sx;
      }
      if (e2 < dx) {
        err = err + dx;
        y0 = y0 + sy;
      }
    }
    lastPoint = [x1, y1];
  };

  $(myCanvas).on('mousedown', drawLineOnMouseMove);
  $(myCanvas).on('mousemove', drawLineOnMouseMove);

  // Add callbacks that are fired any time the pixel data changes and adjusts the canvas appropriately.
  // Note that child_added events will be fired for initial pixel data as well.
  var drawPixel = function(snapshot) {
    var coords = snapshot.key().split(":");
    myContext.fillStyle = "#" + snapshot.val();
    myContext.fillRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
  };
  var clearPixel = function(snapshot) {
    var coords = snapshot.key().split(":");
    myContext.clearRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
  };
  pixelDataRef.on('child_added', drawPixel);
  pixelDataRef.on('child_changed', drawPixel);
  pixelDataRef.on('child_removed', clearPixel);


  //Auth
  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.login = function(authMethod) {
    FBURL.auth.$authWithOAuthRedirect(authMethod).then(function(authData) {
      console.log(authData);
    }).catch(function(error) {
      if (error.code === 'TRANSPORT_UNAVAILABLE') {
        FBURL.auth.$authWithOAuthPopup(authMethod).then(function(authData) {
          console.log(authData);
          $scope.modal.hide();
        });
      } else {
        console.log(error);
      }
    });
  };
  //
  FBURL.auth.$onAuth(function(authData) {
    if (authData === null) {
      console.log('Not logged in yet');
    } else {
      console.log('Logged in as', authData.uid);
      // $scope.modal.hide();
      $ionicScrollDelegate.resize();

    }
    $scope.authData = authData; // This will display the user's name in our view
  });

})
