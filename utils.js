var utils = {
	parseIwlist: function (str) {
	    var out = str.replace(/^\s+/mg, '');
	    out = out.split('\n');
	    var cells = [];
	    var line;
	    var info = {};
	    var fields = {
	        'mac' : /^Cell \d+ - Address: (.*)/,
	        'ssid' : /^ESSID:"(.*)"/,
	        // 'protocol' : /^Protocol:(.*)/,
	        // 'mode' : /^Mode:(.*)/,
	        // 'frequency' : /^Frequency:(.*)/,
	        'encryption_key' : /Encryption key:(.*)/,
	        // 'bitrates' : /Bit Rates:(.*)/,
	        // 'quality' : /Quality(?:=|\:)([^\s]+)/,
	        'signal_level' : /Signal level(?:=|\:)([-\w]+)/
	    };

	    for (var i=0,l=out.length; i<l; i++) {
	        line = out[i].trim();

	        if (!line.length) {
	            continue;
	        }
	        if (line.match("Scan completed :")) {
	            continue;
	        }
	        if (line.match("Interface doesn't support scanning.")) {
	            continue;
	        }

	        if (line.match(fields.mac)) {
	            cells.push(info);
	            info = {};
	        }

	        for (var field in fields) {
	            if (line.match(fields[field])) {
	                info[field] = (fields[field].exec(line)[1]).trim();
	            }
	        }
	    }
	    cells.push(info);
	    cells.shift();
	    return cells;
	},
	/**
	 * http get request
	 * @param  {String}   url
	 * @param  {Function} cb(response, error)
	 */
	get: function (raw, url, cb) {
		var request = require('request');
		//prettyJSON(raw);
		var options = {
		  uri: encodeURI(url),
		  method: 'GET',
		  json: raw
		};

		request(options, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		    console.log(body.id) // Print the shortened url.
		    cb(body);
		  } else {
		  	console.log("GET error");
		  	console.log(utils.fullJSON({post: {error: error, body: body}}));
		  }
		});	
	},
	/**
	 * http post request
	 * @param  {String} url
	 * @param  {Function} cb(response, error)
	 */	
	post: function (raw, url, cb) {
		var request = require('request');
		//prettyJSON(raw);
		var options = {
		  uri: encodeURI(url),
		  method: 'POST',
		  json: raw
		};

		request(options, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		    console.log(body) // Print the shortened url.
		    cb(body);
		  } else {
		  	console.log("POST error");
		  	console.log(utils.fullJSON({post: {error: error, body: body}}));
		  }
		});	
	},
	fullJSON: function(obj) {
	    return JSON.stringify(obj, null, " ");
	}
}

module.exports = utils;