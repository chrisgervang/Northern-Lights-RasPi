var Hapi 	   = require('hapi');
var sys  	   = require('sys');
var fs   	   = require('fs');
var exec 	   = require('child_process').exec;
var prettyjson = require('prettyjson');
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
			"wpa-ssid \"{ssid}\"\n" +
			"wpa-psk \"{password}\"",
		
		access: "auto lo\n\n" +
			"iface lo inet loopback\n" + 
			"iface eth0 inet dhcp\n\n" + 
			"iface wlan0 inet static\n" +
			"address 192.168.42.1\n" + 
			"netmask 255.255.255.0"
	}
}



exec("sudo ifconfig wlan0 down", puts);
setTimeout(function(){initAccess()}, 1000);

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
		// reply('connected!');
		// console.log("shutdown muwa ha ha");

		// exec("sudo shutdown -h now", puts);
		// console.log("deauth everyone!");
		// exec("aireplay-ng -0 1 -a 08:86:3B:F3:CC:AC wlan0", puts);

		var connect = networkInterfaces.content.connect;
		connect = connect.replace("{ssid}", credentials.ssid);
		connect = connect.replace("{password}", credentials.password);

		console.log(connect);
		//init wifi
		exec("sudo service hostapd stop", puts);
		setTimeout(function(){

			exec("sudo service isc-dhcp-server stop", puts);
			setTimeout(function() {

				console.log("sudo ifconfig wlan0 down");
				exec("sudo ifconfig wlan0 down", puts);
				setTimeout(function(){
					exec("sudo ifdown wlan0", puts);
					setTimeout(function(){
						fs.writeFile(networkInterfaces.path, connect, function(err) {
						    if(err) {
						        console.log(err);
						    } else {
						        console.log("networkInterfaces.content.connect was saved!");
						        // console.log("waiting for 10 secs: access point init");
						        setTimeout(function(){ 
						        	console.log("sudo ifup wlan0");
						        	exec("sudo ifup wlan0", puts);
						        }, 1000);
						    }
						});
					},4000);
				},2000);
			}, 4000);
		}, 2000);
		

	}

	var networks = function(request, reply) {
		exec("iwlist scan", function (error, stdout, stderr) { 
			var networks = {networks: parseIwlist(stdout)}
			console.log(prettyjson.render(networks));
			reply(networks).code(200);
		});
	}

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

function parseIwlist(str) {
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
        // 'encryption_key' : /Encryption key:(.*)/,
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
}
