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
var jf = require('jsonfile');
//require("./check-online.js");

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




var initAccess = function() {
	
	var util = require('util');

	var file = './settings.json';
	jf.readFile(file, function(err, obj) {
	  console.log(err, obj)); 

	  if (!err) {
	  	//file exists and we should start up a client
	  } else {
	  	//error with persistent file, so lets boot up the old way!
	  
	  	//init access point
	  	console.log("Tried to spawn ap");
	  	var ap = exec('sudo sh ./ap.sh wlan0');

	  	ap.stdout.on('data', function(data) {
	  		console.log('stdout: ' + data);
	  	});

	  	ap.stderr.on('data', function(data) {
	  	    console.log('stderr: ' + data);
	  	});
	  	ap.on('exit', function () { 
	  		console.log('ap ended!'); 
	  		initServer();
	  		
	  	});
	  }

	  
	});

	
}
// exec("sudo ifconfig wlan0 down", puts);
// exec("sudo ifconfig wlan1 down", puts);
setTimeout(function(){initAccess()}, 1500);


console.log("watching file");
// fs.watch("/var/log/syslog", {
//   persistent: true
// }, function(event, filename) {
//   console.log(".");
// });
var tail = spawn('tail', ['-f', '-n', '1', "/var/log/syslog"]);

tail.stdout.on('data', function (data) {
    var lines = data.toString('utf-8').split('\n');
    _.forEach(lines, function(line){
    	var line = line.split(' raspberrypi ')[1];
    	if (!line) {
    		// console.log('');
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

