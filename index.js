var Hapi = require('hapi');
var sys  = require('sys');
var fs   = require('fs');
var exec = require('child_process').exec;
var puts = function(error, stdout, stderr) { sys.puts(stdout) }

//init access point
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
		
		access: "auto lo\n\niface lo inet loopback\niface eth0 inet dhcp\n\niface wlan0 inet static\naddress 192.168.42.1\nnetmask 255.255.255.0"
	}
}

fs.writeFile(networkInterfaces.path, networkInterfaces.content.access, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("networkInterfaces.content.access was saved!");
        exec("ifconfig wlan0 192.168.42.1", puts);
        exec("sudo service isc-dhcp-server start", puts);
        exec("sudo service hostapd start", puts);
    }
});

// Create a server with a host and port
var server = Hapi.createServer('192.168.1.74', 8000);

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

// Start the server
server.start();