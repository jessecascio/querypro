/*
 * Created apart from app.js so it can be easily stubbed out
 * during testing or tested independently
 */
(function(angular) {
    
    // @todo Create a Chart parent class
    angular.module("querypro").service('AreaChart', function() {
    	
        var _container;
        var _columns;
        var _rows;
        var _options = {}; // optional

        /**
         * @param Array - {"Column Name":"type"}
         */
        this.setColumns = function (columns)
        {
            _columns = columns;
        }

        this.setOptions = function (options)
        {
            _options = options;
        }

        this.setContainer = function (container)
        {
            _container = container;
        }

        this.setData = function (data)
        {
            _rows = data;
        }

        this.render = function() {

            if (!_columns || !_rows || !_container || !document.getElementById(_container)) {
                // have a debug service which uses a debug constant
                return;
            }

            var data = new google.visualization.DataTable();

            for (var column in _columns) {
                data.addColumn(_columns[column], column);
            }

            data.addRows(_rows);

            // @todo Do a google defined check
            var chart = new google.visualization.AreaChart(document.getElementById(_container));
            chart.draw(data, _options);
        }
    	
    });
       
})(this.angular);