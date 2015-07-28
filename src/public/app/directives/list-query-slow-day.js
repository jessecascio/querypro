
(function(angular) {
    
    angular.module("querypro").directive('listQuerySlowDay', function($http, queryproUrl) {	

        return {
            restrict: 'E',
            templateUrl: 'app/views/templates/list-query-slow-day.html',
            link: function(scope, element, attrs) {
                
                // each point is a row in the list
                scope.list = {};

                scope.$watch("globals.application", function(newValue, oldValue) {
                    list(scope, $http, queryproUrl);
                });

                function list(scope, http, queryproUrl)
                {
                    // which application to graph
                    if (!angular.isDefined(scope.globals.application)) {
                        console.log("nope");
                        return;
                    }

                    var data = queryproUrl + encodeURIComponent('select * from "qprollup.'+scope.globals.application+'.daily.slow.queries" limit 70');

                    http.get(data).success(function(response){
                        if (response[0].points.length) {
                            scope.list = response[0].points;    
                        }
                    }).error(function(error){
                        return;
                    });
                }
            }

        };    	
    });
       
})(this.angular);