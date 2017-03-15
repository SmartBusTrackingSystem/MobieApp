/**
 * Created by chshi on 3/7/2017.
 */
app.service('sharedData', function ($q) {
  var buses = {};
  var currentAddress = {};
  var routeInfo = {};
  var beaconInfo = {};
  var geocoder = null;

  return {
    getBuses: function () {
      return buses;
    },

    getBus: function (id) {
      //console.log(buses);
      for (var i = 0; i < buses.length; i++) {
        if (buses[i]._id == parseInt(id)) {
          return buses[i];
        }
      }
    },
    getAllBuses: function () {
     return buses;
    },
    setBuses: function (value) {
      buses = value;
    },
    removeBuses: function () {
      delete buses;
      buses = {};
    },
    setRouteInfo: function (value) {
      routeInfo = value;
    },
    getRouteInfo: function (routeId) {
      for (var i = 0; i < routeInfo.length; i++) {
        // console.log(typeof routeInfo[i].route_id);
        // console.log(typeof routeId);
        // console.log(routeInfo[i].route_id)
        // console.log(routeId)
        if (parseInt(routeInfo[i].route_id) == parseInt(routeId)) {
          return routeInfo[i];
        }
      }
    },
    setBeaconInfo: function (value) {
      beaconInfo = value;
    },
    getBeaconInfo: function (routeId) {
      console.log(beaconInfo);
      for (var i = 0; i < beaconInfo.length; i++) {
        console.log(parseInt(beaconInfo[i].route_id) == parseInt(routeId));
        if (parseInt(beaconInfo[i].route_id) == parseInt(routeId)) {
          return beaconInfo[i];
        }
      }
    },
    getAddress: function () {
      return currentAddress;
    },
    setAddress: function (source, destination) {
      console.log(source + " " + destination);
      currentAddress['source'] = source;
      currentAddress['destination'] = destination;
    },
    removeAddress: function (source, destination) {
      currentAddress = null;
    },
    getGeoCodeAddress: function (loc, i) {
      if (geocoder == null) {
        geocoder = new google.maps.Geocoder; }
       var defer = $q.defer();
      setTimeout(function () {
        geocoder.geocode({'location': loc}, function (results, status) {
          //console.log(status)
          if (status === 'OK') {
            if (results[1]) {
              defer.resolve(results[1].formatted_address)
            }
          }
        });
      },  (i*1000));

       return defer.promise;
    }
  }
});
