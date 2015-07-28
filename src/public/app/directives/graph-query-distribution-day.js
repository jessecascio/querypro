
(function(angular) {
    
    angular.module("querypro").directive('graphQueryDistributionDay', function($interval, $http, queryproUrl, ColumnChart) {	

        return {
            restrict: 'E',
            templateUrl: 'app/views/templates/graph-query-distribution-day.html',
            link: function(scope, element, attrs) {
                
                // watch for the current application to be updated
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

                    // @todo Can we limit curl calls ???
                    var select = queryproUrl + encodeURIComponent('select count(hash) from "'+scope.globals.application+'" where "select"=1 group by time(1d) limit 14');
                    var update = queryproUrl + encodeURIComponent('select count(hash) from "'+scope.globals.application+'" where "update"=1 group by time(1d) limit 14');
                    var insert = queryproUrl + encodeURIComponent('select count(hash) from "'+scope.globals.application+'" where "insert"=1 group by time(1d) limit 14');
                    var del    = queryproUrl + encodeURIComponent('select count(hash) from "'+scope.globals.application+'" where "delete"=1 group by time(1d) limit 14');
                    
                    // var urlD = queryproUrl + encodeURIComponent('select max(duration) from "'+scope.globals.application+'" group by time(1h) limit 24');

                    var dist = new Array();

                    // @write-up - chaining ajax calls, talk about promises, etc.
                    // @todo LESS REPEATING CODE
                    http.get(select).then(function(response){
                        if (response.data.length) {
                            for (var i in response.data[0].points) {

                                if (typeof dist[response.data[0].points[i][0]] == "undefined") {
                                    dist[response.data[0].points[i][0]] = new Array();
                                }

                                dist[response.data[0].points[i][0]]['select'] = response.data[0].points[i][1];
                            }  
                        }
                        
                        return http.get(update);
                    }).then(function(response){

                        if (response.data.length) {
                            for (var i in response.data[0].points) {

                                if (typeof dist[response.data[0].points[i][0]] == "undefined") {
                                    dist[response.data[0].points[i][0]] = new Array();
                                }

                                dist[response.data[0].points[i][0]]['update'] = response.data[0].points[i][1];
                            } 
                        }
                       
                        return http.get(insert);
                    }).then(function(response){

                        if (response.data.length) {
                            for (var i in response.data[0].points) {

                                if (typeof dist[response.data[0].points[i][0]] == "undefined") {
                                    dist[response.data[0].points[i][0]] = new Array();
                                }

                                dist[response.data[0].points[i][0]]['insert'] = response.data[0].points[i][1];
                            }
                        }

                        return http.get(del);
                    }).then(function(response){

                        if (response.data.length) {
                            for (var i in response.data[0].points) {

                                if (typeof dist[response.data[0].points[i][0]] == "undefined") {
                                    dist[response.data[0].points[i][0]] = new Array();
                                }

                                dist[response.data[0].points[i][0]]['delete'] = response.data[0].points[i][1];
                            }
                        }
                        
                        render(dist, ColumnChart);
                    });
                }

                function render(distribution, ColumnChart) {
                    
                    var data = new Array();

                    for (var t in distribution) {
                        var date = new Date(Number(t));
                        data.unshift([
                            date.getMonth() + "/" + date.getDate(),
                            typeof distribution[t]['select'] != "undefined" ? distribution[t]['select'] : 0,
                            typeof distribution[t]['update'] != "undefined" ? distribution[t]['update'] : 0,
                            typeof distribution[t]['delete'] != "undefined" ? distribution[t]['delete'] : 0,
                            typeof distribution[t]['insert'] != "undefined" ? distribution[t]['insert'] : 0,
                        ]);
                    }
                    
                    ColumnChart.setContainer('graph-query-distribution-day');
                    ColumnChart.setColumns([
                        'SELECT','UPDATE','DELETE','INSERT'
                    ]);
                    ColumnChart.setOptions({
                        height: 400,
                        legend: { position: 'top', maxLines: 3 },
                        vAxis: {
                            minValue: 0,
                            ticks: [0, .3, .6, .9, 1]
                        },
                        isStacked: 'percent'
                    });
                    ColumnChart.setData(data);

                    ColumnChart.render();
                }
            }

        };    	
    });
       
})(this.angular);