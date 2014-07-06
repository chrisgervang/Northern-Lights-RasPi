var utils	   = require('../utils.js');
var exec 	   = require('child_process').exec;
var prettyjson = require('prettyjson');
var puts 		= function(error, stdout, stderr) { sys.puts(stdout) }
var networks = function(request, reply) {
	exec("iwlist scan", function (error, stdout, stderr) { 
		var networks = {networks: utils.parseIwlist(stdout)}
		console.log(prettyjson.render(networks));
		reply(networks).code(200);
	});
}

module.exports = networks;