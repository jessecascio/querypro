
(function(angular) {

angular.module("querypro").controller('SeriesController', function($scope, $http, queryproUrl){
	
	/**
	 * @var array - list of series names
	 */
	$scope.series = new Array();
	
	/**
	 * @event - when series is updated
	 */
	$scope.seriesChange = function(application)
	{
		$scope.globals.application = application;
	}

	/**
	 * Pull the series list
	 */
	var url = queryproUrl + encodeURIComponent('list series');

	$http.get(url).success(function(response){
	    var points = response[0].points;

	    for (var i in points) {
	    	
	    	// ignore existing querypro rollup tables
	    	if (points[i][1].indexOf("qprollup") == 0) {
	    		continue;
	    	}

	        $scope.series.push(points[i][1]);
	    }
		
		// if series, sort and set default
		if ($scope.series.length) {
			$scope.series.sort();
			$scope.globals.application = $scope.series[0];	
		}
	});

});

})(this.angular);
	