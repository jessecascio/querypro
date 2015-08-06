
(function(angular) {

    angular.module("querypro").config(function($routeProvider) { // $locationProvider
		
		// $locationProvider.html5Mode(true);

		// <base>/#/list
		$routeProvider.when("/query/frequency", {
			templateUrl: "/app/views/query-frequency.html"
			// controller: "myController"
		});

		// <base>/#/list
		$routeProvider.when("/query/distribution", {
			templateUrl: "/app/views/query-distribution.html"
			// controller: "myController"
		});

		// <base>/#/list
		$routeProvider.when("/query/latency", {
			templateUrl: "/app/views/query-latency.html"
			// controller: "myController"
		});

		$routeProvider.otherwise({
			templateUrl: "/app/views/dashboard.html"
			// redirectTo: "/login"
		});

	});
       
})(this.angular);