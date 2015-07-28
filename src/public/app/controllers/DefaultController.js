
(function(angular) {

// "parent" controller
angular.module("querypro").controller('DefaultController', function($scope, $http){
	
	/**
	 * Application globals
	 */
	$scope.globals = {};

	/**
	 * @var string - current application name
	 */
	$scope.globals.application = undefined;	
	
});

})(this.angular);
	