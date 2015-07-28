/*
 * Created apart from app.js so it can be easily stubbed out
 * during testing or tested independently
 */
(function(angular) {

    angular.module("querypro").factory('bootstrap', function() {
    	
    	return {
    		init: function() {
    			console.log('bootstraping...');
    		}
    	};

    });
       
})(this.angular);