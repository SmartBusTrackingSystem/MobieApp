app.factory('BusSearchFactory',["$http", function($http){
  var searchService =  {

    searchBus: function(source, destination){
         return $http.get("http://shivanageshchandra.com:3000/api/search/getBusesNearMe?source="+source+"&destination="+destination);
    }

  }

  return searchService;


}]);
