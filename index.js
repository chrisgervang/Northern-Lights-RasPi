var Hapi 	   = require('hapi');
var sys  	   = require('sys');
var fs   	   = require('fs');
var exec 	   = require('child_process').exec;
var spawn	   = require('child_process').spawn;
var prettyjson = require('prettyjson');
var connect    = require('./handlers/connect.js');
var networks   = require('./handlers/networks.js');
var puts 		= function(error, stdout, stderr) { sys.puts(stdout) }
var EventSource = require('eventsource');
var _ 			= require('lodash');

require("./check-online.js");

var networkInterfaces = {
	path: "/etc/network/interfaces",
	content: {
		connect: "auto lo\n\n" + 
			"iface lo inet loopback\n" +
			"iface eth0 inet dhcp\n\n" +
			"auto wlan0\n" + 
			"allow-hotplug wlan1\n" + 
			"iface wlan1 inet dhcp\n" +
			"wpa-ssid \"{ssid}\"\n" +
			"wpa-psk \"{password}\"\n" +
			"iface wlan0 inet static\n" +
			"address 10.4.20.1\n" + 
			"netmask 255.255.255.0\n\n"+
			"wireless-power off",
		
		access: "auto lo\n\n" +
			"iface lo inet loopback\n" + 
			"iface eth0 inet dhcp\n\n" + 
			"iface wlan0 inet static\n" +
			"address 10.4.20.1\n" + 
			"netmask 255.255.255.0\n\n"+
			"wireless-power off",
	}
}



exec("sudo ifconfig wlan0 down", puts);
exec("sudo ifconfig wlan1 down", puts);
setTimeout(function(){initAccess()}, 1500);

var initAccess = function() {
	//init access point

	var ap = spawn('sudo sh /home/pi/NL-Pi/ap.sh', ['wlan0']);

	ap.stdout.on('data', function(data) {
		var lines = data.toString('utf-8').split('\n');
		console.log(lines);
		if (_.contains(lines, "announce: init server")) {
			console.log("init server triggered");
			initServer();
			// ap.kill()
		}
	});
}


console.log("watching file");
// fs.watch("/var/log/syslog", {
//   persistent: true
// }, function(event, filename) {
//   console.log(".");
// });
var tail = spawn('tail', ['-n', '1', '-F', "/var/log/syslog"]);

tail.stdout.on('data', function (data) {
    var lines = data.toString('utf-8').split('\n');
    _.forEach(lines, function(line){
    	var line = line.split(' raspberrypi ')[1];
    	if (!line) {
    		console.log('\n');
    	} else {
    		console.log(line);
    	}
    	
    })
 	
});

process.on('exit', function () {
    tail.kill();
});


var initServer = function() {
	console.log("init server");
	// Create a server with a host and port
	var server = Hapi.createServer('10.4.20.1', 8000);

	server.route([
		{ method: 'GET', path: '/{path*}', handler: {
		        directory: { path: './public/', listing: true, index: true }
		    }
		},{ method: 'POST', path: '/connect', handler: connect 
		},{ method: 'GET', path: '/ping', handler: function(request, reply){
				reply('pong');
			}
		},{
			method: 'GET', path: '/networks', handler: networks
		}
	]);
	console.log("init routes");

	// Start the server
	server.start();
	console.log("start server");
}

