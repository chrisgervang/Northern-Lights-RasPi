var Hapi = require('hapi');
var sys  = require('sys');
var fs   = require('fs');
var exec = require('child_process').exec;
var puts = function(error, stdout, stderr) { sys.puts(stdout) }

//init access point
console.log("sudo ifdown wlan0");
exec("sudo ifdown wlan0", puts);

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
console.log("writing file");

fs.writeFile(networkInterfaces.path, networkInterfaces.content.access, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("networkInterfaces.content.access was saved!");
        exec("ifconfig wlan0 192.168.42.1", puts);
        exec("sudo service isc-dhcp-server start", puts);
        exec("sudo service hostapd start", puts);
        initServer();
    }
});

console.log("watching file");
fs.watch("/var/log/syslog", {
  persistent: true
}, function(event, filename) {
  console.log(event + " event occurred on " + filename);
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
