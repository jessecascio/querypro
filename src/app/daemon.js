
/**
 * TODO -  create a system for a calling multiple daemons on a schedule
 * TODO -  make object oriented
 * TODO -  wayyyyy too much code duplication
 * TODO -  why is there no logging !!! :-(
 * TODO -  tests pleassssseeeee.....
 */

var influxRollupSlowQueries = function() {
    console.log("[Running Influx Daemon ...]");   

    var influx = require('influx');
    var http   = require('http');

    var client = influx({
      host : process.env.QUERYPRO_QUERYPRODATA_1_PORT_8086_TCP_ADDR, // set by container
      port : 8086,
      protocol : 'http', 
      username : process.env.DB_USER,
      password : process.env.DB_PASS,
      database : 'querypro'
    });

    var series = new Array();

    // grab all the series that need to be rolled up
    client.query('list series', function (err, results) {

    	if (typeof results == "undefined") {
    		return;
    	}

    	for (var i in results[0]['points']) {

    		// ignore existing querypro rollup tables
    		if (results[0]['points'][i][1].indexOf("qprollup") == 0) {
    			continue;
    		}

    		series.push(results[0]['points'][i][1]);
    	}

    	doHourlyRollup(series);
    	doDailyRollup(series);
    });

    /**
     * @param Array - series names
     */
    function doHourlyRollup(seriesList)
    {
    	// rollup  each series
    	for (var i=0; i<seriesList.length; i++) {

    		var series = seriesList[i];

    		// grab top 10 slowest queries per hour
    		var q = "SELECT top(duration,10) from "+series+" group by time(1h) limit 240";

    		client.query(q, function (err, results) {
    		
    			if (typeof results == "undefined") {
    				return;
    			}

    			// track greatest durations
    			var durations = new Array();

    			for (var j in results[0]['points']) {
    				
    				var time = results[0]['points'][j][0];

    				if (typeof durations[time] == "undefined") {
    					durations[time] = new Array();
    				}

    				// greatest durations saved per timestamp
    				durations[time].push(results[0]['points'][j][1]);
    			}

    			// build queries to get the queries for the duration / time combinations
    			var queries = new Array();

    			for (var time in durations) {
    				// create the IN statment
    				var iin = "duration=" + durations[time].join(" OR duration=");
    				// be sure to adjust time since no greater than equals to
    				queries.push("SELECT time, duration, query FROM "+series+" WHERE time > "+(time/1000 - 1)+"s AND time < " + (time/1000 + 3600) + "s AND ("+iin+")");
    			}

    			// run each query
    			for (var k in queries) {

    				client.query(queries[k], function (err, results) {
    					
    					if (typeof results == "undefined") {
    						return;
    					}

    					var points = new Array();

    					// grab all the queries with duration and time stamp
    					for (var j in results[0]['points']) {
    						var s = String(results[0]['points'][j][0]); // time
    						s = s.slice(0,10); // time in s not ms

    						var t = Number(s); 
    						t = t - t % 3600; // round down to nearest hour

    						points.push({
    							duration: results[0]['points'][j][2],
    							query: results[0]['points'][j][3],
    							time: t
    						});
    					}

    					// sort by duration
    					sortByDuration(points);

    					// use sequence for order by when pulling data
    					for (var j in points) {
    						points[j].sequence_number = Number(j);
    					}

    					// batch write
    					client.writePoints("qprollup."+series+".hourly.slow.queries", points, [], function call(e,r) {
    						if (e != null) {
    							console.log(e); // absolutely no error handling :-(	
    						}
    					});
    				});
    			}
    		});
    	}
    }

    /**
     * @param Array - series names
     */
    function doDailyRollup(seriesList)
    {
    	// rollup each series
    	for (var i=0; i<seriesList.length; i++) {

    		var series = seriesList[i];

    		// grab top 10 slowest queries per day
    		var q = "SELECT top(duration,10) from "+series+" group by time(1d) limit 310";

    		client.query(q, function (err, results) {
    		
    			if (typeof results == "undefined") {
    				return;
    			}

    			// track greatest durations
    			var durations = new Array();

    			for (var j in results[0]['points']) {
    				
    				var time = results[0]['points'][j][0];

    				if (typeof durations[time] == "undefined") {
    					durations[time] = new Array();
    				}

    				// greatest durations saved per timestamp
    				durations[time].push(results[0]['points'][j][1]);
    			}

    			// build queries to get the queries for the duration / time combinations
    			var queries = new Array();

    			for (var time in durations) {
    				// create the IN statment
    				var iin = "duration=" + durations[time].join(" OR duration=");
    				// be sure to adjust time since no greater than equals to
    				queries.push("SELECT time, duration, query FROM "+series+" WHERE time > "+(time/1000 - 1)+"s AND time < " + (time/1000 + 86400) + "s AND ("+iin+")");
    			}

    			// run each query
    			for (var k in queries) {

    				client.query(queries[k], function (err, results) {
    					
    					if (typeof results == "undefined") {
    						return;
    					}
    					
    					var points = new Array();

    					// grab all the queries with duration and time stamp
    					for (var j in results[0]['points']) {
    						var s = String(results[0]['points'][j][0]); // time
    						s = s.slice(0,10); // time in s not ms

    						var t = Number(s); 
    						t = t - t % 86400; // round down to nearest hour

    						points.push({
    							duration: results[0]['points'][j][2],
    							query: results[0]['points'][j][3],
    							time: t
    						});
    					}

    					// sort by duration
    					sortByDuration(points);

    					// use sequence for order by when pulling data
    					for (var j in points) {
    						points[j].sequence_number = Number(j);
    					}

    					// batch write
    					client.writePoints("qprollup."+series+".daily.slow.queries", points, [], function call(e,r) {
    						if (e != null) {
    							console.log(e); // absolutely no error handling :-(	
    						}
    					});
    				});
    			}
    		});
    	}
    }

    /**
     * @param array
     */
    function sortByDuration(array) {
        return array.sort(function(a, b) {
            var x = a["duration"]; var y = b["duration"];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    console.log("[Finishing Influx Daemon ...]");
};

influxRollupSlowQueries();
setInterval(influxRollupSlowQueries, 60000); // call every 60 second
