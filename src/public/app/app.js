
/*
 * Defines the AngularJS application module and initializes it
 */
(function(angular) {

angular.module('querypro', ["ngRoute"])
	// @todo - set up route for pulling DB credentials
	.value("queryproUrl", "http://"+location.host+":8086/db/querypro/series?u=querypro&p=qu3rIPr0L@ck3D!&q=")
	.run(['bootstrap', function(bootstrap) {
		bootstrap.init();
	}]);

})(this.angular);
	