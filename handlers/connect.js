var exec 	   = require('child_process').exec;
var spawn	   = require('child_process').spawn;
var prettyjson = require('prettyjson');
var fs   	   = require('fs');
var sys  	   = require('sys');
var puts 		= function(error, stdout, stderr) { sys.puts(stdout) }
var utils		= require('../utils.js');
var _ 			= require('lodash');
var jf = require('jsonfile');



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
			var mining = spawn("bfgminer", ["-o", "stratum+tcp://uk1.ghash.io:3333", "-u", "chrisgervang.worker1", "-p", "bit", "-S", "bigpic:all", "--syslog"]);
			//bfgminer -o stratum+tcp://uk1.ghash.io:3333 -u chrisgervang.worker1 -p bit -S bigpic:all 2>logfile.txt
			// mining.stdout.on('data', function(data) {
			// 	console.log('  mining stdout: ' + data);
			// });

			mining.stderr.on('data', function(data) {
			    console.log('  mining stderr: ' + data);
			});
			mining.on('exit', function () { 
				// if (mining === false) {
				// 	initMining();
				// };
				console.log('  mining ended!'); 
			});

			process.on('exit', function () {
			    console.log("mining killed on exit");
			    mining.kill();
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

	var client = exec('sudo sh ./client.sh wlan1 \"' + credentials.ssid + '\" ' + credentials.password + ' wlan0');

	client.stdout.on('data', function(data) {
		console.log('stdout: ' + data);

		var tail = spawn('tail', ['-f', '-n', '1', "/var/log/syslog"]);

		
		//look for success or fail logs.
		tail.stdout.on('data', function (data) {
		    var lines = data.toString('utf-8').split('\n');
		    console.log("LINES: ", lines)
		    _.forEach(lines, function(line){
		    	var line = line.split(' raspberrypi ')[1];
		    	if (!!line) {
		    		//console.log(line);
		    		
		    		//If success, reply success. Save credentials in a new file called "settings.conf".
		    		if(_.contains(line, "dhclient: bound to ")) {
		    			//the connection was a success!
		    			console.log("SUC connected to " + credentials.ssid);
		    			var settings = {
		    				ssid: credentials.ssid,
		    				password: credentials.password,
		    				persist: true
		    			};
		    			var file = "./settings.json";

		    			jf.writeFile(file, settings, function(err) {
		    			  console.log(err);
		    			  console.log("settings files saved");
		    			});

		    			reply("client connected").code(200);
		    		
		    		//If fail, reply fail. Also reset client script to get it back to the "AP only" state.
		    		} else if(_.contains(line, "wlan1: WPA: 4-Way Handshake failed - pre-shared key may be incorrect")) {
		    			var ifdown = exec("sudo ifdown wlan1");
		    			console.log("ERR incorrect password");
		    			ifdown.on('exit', function () { 
		    				reply("incorrect password").code(200);
		    				console.log('ifdown wlan1 ended!'); 
		    			});
		    		}
		    	}
		    })
		 	
		});

		process.on('exit', function () {
		    console.log("tail killed on exit");
		    tail.kill();
		});


		//	On startup, check for settings.conf and either set up an AP or just connect to a client with those creds.

		
	});

	client.stderr.on('data', function(data) {
	    console.log('stderr: ' + data);
	});
	client.on('exit', function () { 
		if (mining === false) {
			setTimeout(function(){initMining()}, 4000);
		};
		
		console.log('client ended!'); 
	});
}

module.exports = connect;
