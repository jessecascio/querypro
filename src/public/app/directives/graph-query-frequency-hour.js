
(function(angular) {
    
    angular.module("querypro").directive('graphQueryFrequencyHour', function($interval, $http, queryproUrl, AreaChart) {	

        return {
            restrict: 'E',
            templateUrl: 'app/views/templates/graph-query-frequency-hour.html',
            link: function(scope, element, attrs) {
            
                scope.$watch("globals.application", function(newValue, oldValue) {
                    graph(scope, $http, queryproUrl);
                });

                $interval(function(){
                    graph(scope, $http, queryproUrl);
                }, 5000); // @todo should be varialized through a config service

                function graph(scope, http, queryproUrl)
                {
                    // which application to graph
                    if (!angular.isDefined(scope.globals.application)) {
                        console.log("nope");
                        return;
                    }

                    var urlQ = queryproUrl + encodeURIComponent('select count(hash) from "'+scope.globals.application+'" group by time(1h) limit 24');
                    var urlD = queryproUrl + encodeURIComponent('select max(duration) from "'+scope.globals.application+'" group by time(1h) limit 24');

                    // @write-up - chaining ajax calls, talk about promises, etc.
                    http.get(urlQ).then(function(response){
                        queries = response.data[0].points;
                        return http.get(urlD);
                    }).then(function(response){
                        duration = response.data[0].points;
                        render(queries, duration, AreaChart);
                    });
                }

                function render(queries, max, AreaChart) {
                    var points = [];

                    for (var i=0; i < queries.length; i++) {
                        points[i] = [];

                        points[i][0] = new Date(queries[i][0]);
                        points[i][1] = queries[i][1];
                        points[i][2] = max[i][1];
                    }
                    
                    AreaChart.setContainer('graph-query-frequency-hour');
                    AreaChart.setColumns({
                        'Data':'datetime',
                        'Queries':'number',
                        'Max Duration':'number'
                    });

                    AreaChart.setData(points);
                    AreaChart.setOptions({
                        'height':300,
                         series: {
                          0: {targetAxisIndex: 0},
                          1: {targetAxisIndex: 1}
                        },
                        vAxes: {
                          // Adds titles to each axis.
                          0: {title: 'Query Count'},
                          1: {title: 'Max Query Time (ms)'}
                        },
                        hAxis: {
                            format: 'hh:mm a' //M/d 
                        }
                    });

                    AreaChart.render();
                }
            }

        };    	
    });
       
})(this.angular);