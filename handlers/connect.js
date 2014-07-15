var exec 	   = require('child_process').exec;
var prettyjson = require('prettyjson');
var fs   	   = require('fs');
var sys  	   = require('sys');
var puts 		= function(error, stdout, stderr) { sys.puts(stdout) }
var utils		= require('../utils.js')

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
			"netmask 255.255.255.0",
		
		access: "auto lo\n\n" +
			"iface lo inet loopback\n" + 
			"iface eth0 inet dhcp\n\n" + 
			"iface wlan0 inet static\n" +
			"address 10.4.20.1\n" + 
			"netmask 255.255.255.0"
	}
}

var initMining = function() {
	console.log("initMining");
	var pong = "undefined";

	var ping = setInterval(function(){
		utils.get({"event": "initMining"}, "http://107.170.245.191:9000/ping", function(body){
			console.log(utils.fullJSON(body));
			pong = body;
		});
		if (pong === "pong") {
			//were online! start mining
			exec("sudo ~/bfgminer/bfgminer -o stratum+tcp://uk1.ghash.io:3333 -u chrisgervang.worker1 -p bit -S bigpic:all 2>logfile.txt", puts);
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

	var connect = networkInterfaces.content.connect;
	connect = connect.replace("{ssid}", credentials.ssid);
	connect = connect.replace("{password}", credentials.password);

	console.log(connect);
	//init wifi
	//exec("sudo service hostapd stop", puts);
	setTimeout(function(){

		//exec("sudo service isc-dhcp-server stop", puts);
		setTimeout(function() {

			//console.log("sudo ifconfig wlan0 down");
			console.log("keeping wlan0 up");
			console.log("*killing wlan1");
			//exec("sudo ifconfig wlan0 down", puts);
			exec("sudo ifconfig wlan1 down", puts);
			setTimeout(function(){
				//exec("sudo ifdown wlan0", puts);
				exec("sudo ifdown wlan1", puts);
				
				setTimeout(function(){
					fs.writeFile(networkInterfaces.path, connect, function(err) {
					    if(err) {
					        console.log(err);
					    } else {
					        console.log("networkInterfaces.content.connect was saved!");
					        // console.log("waiting for 10 secs: access point init");
					        setTimeout(function(){ 
					        	console.log("sudo ifup wlan1");
					        	exec("sudo ifup wlan1", puts);
					        	setTimeout(function(){initMining();}, 3000);
					        }, 1000);
					    }
					});
				},4000);
			},2000);
		}, 4000);
	}, 2000);
}

module.exports = connect;