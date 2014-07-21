var exec 	   = require('child_process').exec;
var spawn	   = require('child_process').spawn;
var prettyjson = require('prettyjson');
var fs   	   = require('fs');
var sys  	   = require('sys');
var puts 		= function(error, stdout, stderr) { sys.puts(stdout) }
var utils		= require('../utils.js');
var _ 			= require('lodash');


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
var mining = false;

var initMining = function() {
	console.log("initMining captured");
	var pong = "undefined";
	mining = true;
	var ping = setInterval(function(){
		utils.get({"event": "initMining"}, "http://107.170.245.191:9000/ping", function(body){
			console.log(utils.fullJSON(body));
			pong = body;
		});
		if (pong === "pong") {
			//were online! start mining
			var mineing = spawn("bfgminer", ["-o", "stratum+tcp://uk1.ghash.io:3333", "-u", "chrisgervang.worker1", "-p", "bit", "-S", "bigpic:all", "2>logfile.txt"]);
			mineing.stdout.on('data', function(data) {
				console.log('mining stdout: ' + data);
			});

			mineing.stderr.on('mining data', function(data) {
			    console.log('stderr: ' + data);
			});
			mineing.stdout.on('end', function () { 
				// if (mining === false) {
				// 	initMining();
				// };
				console.log('mineing ended!'); 
			});
			clearInterval(ping);
			console.log("started mining!");
			//TODO: send "event: miner, data: online" to firebase and/or our server.
		} else {
			console.log("couldn't reach server... trying again");
		}
	}, 3000);

}

// Add the route
var connect = function (request, reply) {
	var credentials = request.payload;
	console.log("hi!", credentials);

	var client = exec('sh ./client.sh wlan1 \"' + credentials.ssid + '\" ' + credentials.password + ' wlan0');

	// client.stdout.on('data', function(data) {
	// 	var lines = data.toString('utf-8').split('\n');
	// 	console.log(lines);
	// 	if (_.contains(lines, "announce: init mining")) {
	// 		console.log("init mining triggered");
	// 		initMining();
	// 		// client.kill()
	// 	}
	// });
	client.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
	});

	client.stderr.on('data', function(data) {
	    console.log('stderr: ' + data);
	});
	client.stdout.on('close', function () { 
		if (mining === false) {
			initMining();
		};
		console.log('client ended!'); 
	});
}

module.exports = connect;