/*
 * Created apart from app.js so it can be easily stubbed out
 * during testing or tested independently
 */
(function(angular) {
    
    angular.module("querypro").service('ColumnChart', function() {
    	
        var _container;
        
        /**
         * @param Array
         */
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

            _columns.unshift('Date');
            _columns.push({role: 'annotation' });

            var points = new Array();
            points.push(_columns);
            
            for (var i in _rows) {
                _rows[i].push(''); // account for role object
                points.push(_rows[i]);
            }

            var data = google.visualization.arrayToDataTable(points);
            
            // @todo Do a google defined check
            var chart = new google.visualization.ColumnChart(document.getElementById(_container));
            chart.draw(data, _options);
        }
    	
    });
       
})(this.angular);