/**
 * Created by chshi on 3/4/2017.
 */
app.config(function($stateProvider,$urlRouterProvider){

  $stateProvider.state('home', {
    url: '/',
    templateUrl : 'templates/home.html'
  });
  $stateProvider.state('busSchedule', {
    url: '/:id',
    templateUrl : 'templates/busSchedule.html',
    controller: 'SingleBusCtrl'
  });
  $stateProvider.state('listBuses', {
    url: '/listBuses/:source/:destination',
    templateUrl : 'templates/listBuses.html',
    controller: 'ListBusesCtrl'
  });

  $stateProvider.state('map', {
    url: '/map/:id',
    templateUrl : 'templates/map.html',
    controller: 'MapCtrl'
  });

  $stateProvider.state('trip', {
    url: '/trip/:id',
    templateUrl : 'templates/trip.html',
    controller: 'TripCtrl'
  });

   $urlRouterProvider.otherwise('/');
});
