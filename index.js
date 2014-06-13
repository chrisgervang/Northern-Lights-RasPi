var Hapi = require('hapi');
var sys  = require('sys');
var fs   = require('fs');
var exec = require('child_process').exec;
var puts = function(error, stdout, stderr) { sys.puts(stdout) }

var networkInterfaces = {
	path: "/etc/network/interfaces",
	content: {
		connect: "auto lo\n\n" + 
			"iface lo inet loopback\n" +
			"iface eth0 inet dhcp\n\n" +
			"auto wlan0\n" + 
			"allow-hotplug wlan0\n" + 
			"iface wlan0 inet dhcp\n" +
			"wpa-ssid \"Gervang Wireless\"\n" +
			"wpa-password \"cocoapunch\"",
		
		access: "auto lo\n\n" +
			"iface lo inet loopback\n" + 
			"iface eth0 inet dhcp\n\n" + 
			"iface wlan0 inet static\n" +
			"address 192.168.42.1\n" + 
			"netmask 255.255.255.0"
	}
}

//init wifi
exec("sudo service hostapd stop", puts);
setTimeout(function(){

	exec("sudo service isc-dhcp-server stop", puts);
	setTimeout(function() {

		console.log("sudo ifconfig wlan0 down");
		exec("sudo ifconfig wlan0 down", puts);
		setTimeout(function(){
			fs.writeFile(networkInterfaces.path, networkInterfaces.content.connect, function(err) {
			    if(err) {
			        console.log(err);
			    } else {
			        console.log("networkInterfaces.content.connect was saved!");
			        exec("sudo ifup wlan0", puts);
			        console.log("waiting for 10 secs: access point init");
			        setTimeout(function(){initAccess()}, 10000);
			    }
			});
		},1000);
	}, 2000);
}, 2000);

var initAccess = function() {
	//init access point
	console.log("sudo ifdown wlan0");
	exec("sudo ifdown wlan0", puts);
	console.log("writing file");
	setTimeout(function(){
		fs.writeFile(networkInterfaces.path, networkInterfaces.content.access, function(err) {
		    if(err) {
		        console.log(err);
		    } else {
		        console.log("networkInterfaces.content.access was saved!");
		        exec("ifconfig wlan0 192.168.42.1", puts);
		        setTimeout(function(){
		        	exec("sudo service isc-dhcp-server start", puts);
			        setTimeout(function(){
			        	exec("sudo service hostapd start", puts);
			        	console.log("waitng 10 seconds: server init");
			        	setTimeout(function(){initServer()}, 10000);
			        }, 1000);
		        }, 1000);
		    }
		});
	},3000);
}


console.log("watching file");
fs.watch("/var/log/syslog", {
  persistent: true
}, function(event, filename) {
  console.log(".");
});

var initServer = function() {
	console.log("init server");
	// Create a server with a host and port
	var server = Hapi.createServer('192.168.42.1', 8000);

	// Add the route
	var connect = function (request, reply) {
		var credentials = request.payload;
		console.log("hi!", credentials);
		reply('connected!');
	}

	server.route([
		{ method: 'GET', path: '/static/jquery-1.11.1.min.js', handler: {
				file: './public/jquery-1.11.1.min.js'
			}
		},
		{ method: 'GET', path: '/{path*}', handler: {
		        directory: { path: './public', listing: false, index: true }
		    }
		},{ method: 'POST', path: '/connect', handler: connect }
	]);
	console.log("init routes");

	// Start the server
	server.start();
	console.log("start server");
}
