/**
 * Created by chshi on 2/27/2017.
 */
app.directive('googleplacesauto', function() {
  return {
    require: 'ngModel',
    link: function($scope, input, attrs, model) {
      var options = {
        types: [],
        componentRestrictions: { country :[]}
      };
      $scope.googleAutoComplete = new google.maps.places.Autocomplete(input[0], options);

      google.maps.event.addListener($scope.googleAutoComplete, 'place_changed', function() {
        $scope.$apply(function() {
          model.$setViewValue(input.val());
        });
      });
    }
  };
});

