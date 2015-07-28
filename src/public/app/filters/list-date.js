
(function(angular) {
    
    angular.module("querypro").filter('listDate', function($filter) {
        return function(input)
        {
            if(input == null){ return ""; } 
            // @todo Remove manual "000" pad for seconds -> milliseconds
            var _date = $filter('date')(new Date(Number(input+"000")), 'MMM dd');
            return _date.toUpperCase();
        };
    });
       
})(this.angular);