
(function(angular) {
    
    angular.module("querypro").directive('graphQueryFrequencyDay', function($interval, $http, queryproUrl, AreaChart) {	

        return {
            restrict: 'E',
            templateUrl: 'app/views/templates/graph-query-frequency-day.html',
            link: function(scope, element, attrs) {
               
                scope.$watch("globals.application", function(newValue, oldValue) {
                    graph(scope, $http, queryproUrl);
                });

                $interval(function(){
                    graph(scope, $http, queryproUrl);
                }, 60000); // @todo should be varialized through a config service

                function graph(scope, http, queryproUrl)
                {
                    // which application to graph
                    if (!angular.isDefined(scope.globals.application)) {
                        console.log("nope");
                        return;
                    }

                    var urlQ = queryproUrl + encodeURIComponent('select count(hash) from "'+scope.globals.application+'" group by time(1d) limit 31');
                    var urlD = queryproUrl + encodeURIComponent('select max(duration) from "'+scope.globals.application+'" group by time(1d) limit 31');

                    var queries  = [];
                    var duration = [];

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

                        // var tmp = new Date(queries[i][0]);
                        // var tzu = new Date(tmp.getUTCFullYear(), tmp.getUTCMonth(), tmp.getUTCDate(), tmp.getUTCHours(), tmp.getUTCMinutes(), tmp.getUTCSeconds());

                        points[i][0] = new Date(queries[i][0]);
                        points[i][1] = queries[i][1];
                        points[i][2] = max[i][1];
                    }
                    
                    AreaChart.setContainer('graph-query-frequency-day');
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
                            format: 'M/d' //M/d 
                        }
                    });

                    AreaChart.render();
                }
            }

        };    	
    });
       
})(this.angular);