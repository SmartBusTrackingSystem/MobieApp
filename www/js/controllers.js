app.controller('HomeCtrl', function ($scope, $state, $cordovaGeolocation, sharedData, $ionicPlatform, $ionicPopup) {
  try {
    $ionicPlatform.ready(function () {
      cordova.plugins.diagnostic.isLocationAvailable(function (available) {
        console.log("Location is " + (available ? "available" : "not available"));
        if (!available) {
          $scope.showConfirm = function () {
            var confirmPopup = $ionicPopup.confirm({
              title: 'Location service',
              template: "Please enable location other app location won't work properly"
            });

            confirmPopup.then(function (res) {
              if (res) {
                console.log('You are sure');
              } else {
                console.log('You are not sure');
              }
            });
          };
          $scope.showConfirm();
        }
      }, function (error) {
        console.error("The following error occurred: " + error);
      });
    });
  }
  catch(err) {
    console.log(err);
  }


  //To enable tap on google places auto complete
  $scope.disableTap = function () {
    var container = document.getElementsByClassName('pac-container');
    angular.element(container).attr('data-tap-disabled', 'true');
    var backdrop = document.getElementsByClassName('backdrop');
    angular.element(backdrop).attr('data-tap-disabled', 'true');
    angular.element(container).on("click", function () {
      document.getElementById('pac-input').blur();
    });
  };

  // To get the current location, covert into address and set it to source
  $scope.getCurrentLocation = function () {
    var options = {timeout: 5000, enableHighAccuracy: true};

    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
      console.log(position);
      var geocoder = new google.maps.Geocoder;

      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      geocoder.geocode({'location': latLng}, function (results, status) {
        if (status === 'OK') {
          if (results[0]) {
            $scope.source = results[0].formatted_address;
            $scope.$apply();
            console.log('Result found');
          } else {
            console.log('No results found');
          }
        } else {
          console.log('Geocoder failed due to: ' + status)
        }
      });
    }, function (err) {
      console.log("Cordova ");
      console.log(err);
    });

  }


  $scope.getBuses = function () {
    sharedData.setAddress($scope.source, $scope.destination);
    $state.go('listBuses', {source: $scope.source, destination: $scope.destination});
  }

});

app.controller('ListBusesCtrl', function ($scope, $state, $stateParams, $cordovaGeolocation, BusSearchFactory, sharedData) {
  //console.log($stateParams.source);
//  console.log($stateParams.destination);
  $scope.buses = [];
  var promise = BusSearchFactory.searchBus($stateParams.source, $stateParams.destination);
  promise.then(function (response) {
    $scope.Math = window.Math;
    $scope.buses = response.data.result.buses;
    $scope.routeInfo = response.data.result.routeInfo;
    $scope.beaconInfo = response.data.result.beaconInfo;
    sharedData.setBuses($scope.buses);
    sharedData.setRouteInfo($scope.routeInfo);
    sharedData.setBeaconInfo($scope.beaconInfo);
    $scope.getRouteInfo = sharedData.getRouteInfo;
    debugger;

  }, function (err) {
    console.log(err)
  });

});

app.controller('SingleBusCtrl', function ($scope, $state, $stateParams, $cordovaGeolocation, BusSearchFactory, sharedData) {
  $scope.bus = sharedData.getBus($stateParams.id);
  $scope.busRoute = sharedData.getRouteInfo($scope.bus.route_id);
  $scope.source = sharedData.getAddress().source;
  $scope.destination = sharedData.getAddress().destination;
  for (var i = 0; i < $scope.busRoute.steps.length; i++) {

    (function (i) {
      //console.log($scope.busRoute.steps[i]);
      var startlatlng = $scope.busRoute.steps[i].start_location;
      //console.log(startlatlng)
      sharedData.getGeoCodeAddress(startlatlng, i).then(function (result) {
        //console.log(result);
        $scope.busRoute.steps[i]['start_formatted_address'] = result;
      });
    })(i);

    (function (i) {
      //console.log($scope.busRoute.steps[i]);
      var endlatlng = $scope.busRoute.steps[i].end_location;
      //console.log(endlatlng)
      sharedData.getGeoCodeAddress(endlatlng, i).then(function (result) {
        //console.log(result);
        $scope.busRoute.steps[i]['end_formatted_address'] = result;
      });
    })(i);
  }


  //debugger;
});

app.controller('MapCtrl', function ($scope, $state, $stateParams, $cordovaGeolocation, BusSearchFactory, sharedData) {
  $scope.bus = sharedData.getBus($stateParams.id);

  $scope.initMap = function (mapCenter) {
    $scope.directionsService = new google.maps.DirectionsService;
    $scope.directionsDisplay = new google.maps.DirectionsRenderer;
    var latLng = new google.maps.LatLng(37.349691, -121.939058);
    var mapOptions = {
      center: latLng,
      zoom: 10
    };
    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    $scope.directionsDisplay.setMap($scope.map);
  }

  $scope.calculateAndDisplayRoute = function (source, destination) {
    $scope.directionsService.route({
      origin: source,
      destination: destination,
      travelMode: 'TRANSIT',
      transitOptions: {
        modes: ['BUS']
      }
    }, function (response, status) {
      if (status === 'OK') {
        $scope.directionsDisplay.setDirections(response);
      } else {
        console.log("Google direction request failed");
      }
    });
  }

  $scope.displayBus = function () {
    google.maps.event.addListenerOnce($scope.map, 'idle', function () {
      var latLng = new google.maps.LatLng($scope.bus.loc.coordinates[1], $scope.bus.loc.coordinates[0]);
      var markerOpts = {
        'clickable': true,
        'cursor': 'pointer',
        'draggable': false,
        'flat': true,
        'icon': {
          'url': 'https://cdn0.iconfinder.com/data/icons/geo-points/154/bus-512.png',
          'size': new google.maps.Size(72, 72),
          'scaledSize': new google.maps.Size(34, 34),
          'origin': new google.maps.Point(0, 0),
          'anchor': new google.maps.Point(34, 34)
        },
        // This marker may move frequently - don't force canvas tile redraw
        'optimized': false,
        'position': latLng,
        'title': 'Bus location',
        'zIndex': 3,
      };

      var marker = new google.maps.Marker(markerOpts);
      marker.setMap($scope.map);

    });
  }

  $scope.getUserLocation = function (callback) {
    var options = {timeout: 10000, enableHighAccuracy: true};

    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
      var obj = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
      callback(obj);
    }, function (error) {
      console.log(error);
      console.log("Could not get location");
      var obj = {
        latitude: 0,
        longitude: 0
      }
      callback(obj);

    });
  }


  //
  // Reference
  // https://github.com/ChadKillingsworth/geolocation-marker/blob/master/src/geolocation-marker.js
  $scope.postionUserLocation = function () {
    var options = {timeout: 5000, enableHighAccuracy: true};

    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
      console.log(position);
      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      google.maps.event.addListenerOnce($scope.map, 'idle', function () {
        $scope.map.setCenter(latLng);
        console.log("Fired user marker");
        var markerOpts = {
          'clickable': true,
          'cursor': 'pointer',
          'draggable': false,
          'flat': true,
          'icon': {
            'url': 'https://chadkillingsworth.github.io/geolocation-marker/images/gpsloc.png',
            'size': new google.maps.Size(34, 34),
            'scaledSize': new google.maps.Size(17, 17),
            'origin': new google.maps.Point(0, 0),
            'anchor': new google.maps.Point(8, 8)
          },
          // This marker may move frequently - don't force canvas tile redraw
          'optimized': false,
          'position': latLng,
          'title': 'Current location',
          'zIndex': 3,
        };

        var circleOpts = {
          'clickable': false,
          'radius': 10,
          'strokeColor': "#2e1e34",
          'strokeOpacity': .4,
          'fillColor': "#61a0bf",
          'fillOpacity': .2,
          'strokeWeight': 1,
          'zIndex': 1,
        };


        var marker = new google.maps.Marker(markerOpts);
        var circle = new google.maps.Circle(circleOpts);

        circle.bindTo('center', marker, 'position');
        marker.setMap($scope.map);
        circle.setMap($scope.map);

        var infoWindow = new google.maps.InfoWindow({
          content: "Here I am!"
        });

        google.maps.event.addListener(marker, 'click', function () {
          infoWindow.open($scope.map, marker);
        });

      });
    }, function (error) {
      console.log(error);
      console.log("Could not get location");
    });
  }
  $scope.initMap();
  $scope.postionUserLocation();
  console.log(sharedData.getAddress());
  $scope.calculateAndDisplayRoute(sharedData.getAddress().source, sharedData.getAddress().destination);
  $scope.displayBus();


});


app.controller('TripCtrl', function ($scope, $state, $stateParams, $cordovaLocalNotification,$ionicPopup, BusSearchFactory, sharedData, $ionicPlatform, $rootScope, $cordovaBeacon) {
  $scope.bus = sharedData.getBus($stateParams.id);
  $scope.beaconInfo = sharedData.getBeaconInfo($scope.bus.route_id);
  console.log($scope.beaconInfo);
  $scope.reminder= false;
  $scope.reminderBtn = "Turn on Reminder";
  $scope.toggleReminder= function(){
    if($scope.reminder == false){
      console.log("Changed values");
      $scope.reminderBtn = "Turn Off Reminder";
      $scope.reminder = true;
      $scope.showAlert = function () {
        var alertPopup = $ionicPopup.alert({
          title: 'Reminder',
          template: 'Great! we will remind you'
        });

        alertPopup.then(function (res) {
          console.log('Reminder scheduled');
        });
      };
      $scope.showAlert();
    }else{
      $scope.reminderBtn = "Turn On Reminder";
      $scope.reminder = false;
      $scope.showAlert = function () {
        var alertPopup = $ionicPopup.alert({
          title: 'Reminder',
          template: 'Got it! Reminder turned off'
        });
        alertPopup.then(function (res) {
          console.log('Reminder Removed');
        });
      };
      $scope.showAlert();
    }
    console.log($scope.reminderBtn);
  }

  try {
    $ionicPlatform.ready(function () {

      $scope.scheduleSingleNotification = function () {
        $cordovaLocalNotification.schedule({
          id: 1,
          title: 'Get ready to get down',
          text: 'Your destination is arriving',
          icon: "res/icon.png"
        }).then(function (result) {
          console.log('Reminder triggered');
        });
      };

      $scope.cancelSingleNotification = function () {
        $cordovaLocalNotification.cancel(1).then(function (result) {
          //console.log("Reminder turnoff")
        });
      };
      $rootScope.$on("$cordovaBeacon:didRangeBeaconsInRegion", function (event, pluginResult) {
        var uniqueBeaconKey;
        for (var i = 0; i < pluginResult.beacons.length; i++) {
          var uniqueBeaconKey = pluginResult.beacons[i].uuid + ":" + pluginResult.beacons[i].major + ":" + pluginResult.beacons[i].minor
          //debugger;
          if ($scope.beaconInfo != null &&
            uniqueBeaconKey.toLowerCase() == $scope.beaconInfo.reminder_beacon_id.toLowerCase()) {
            if($scope.reminder) {
              $scope.scheduleSingleNotification();
            }else{
              $scope.cancelSingleNotification();
            }
            console.log(pluginResult.beacons[i]);
          }
        }
        $scope.$apply();
      });

      $cordovaBeacon.startRangingBeaconsInRegion($cordovaBeacon.createBeaconRegion("estimote", "b9407f30-f5f8-466e-aff9-25556b57fe6d"));
    });

  }catch (err){
    console.log("Platform not supported ");
  }

});
