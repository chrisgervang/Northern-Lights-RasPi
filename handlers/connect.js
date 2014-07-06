var exec 	   = require('child_process').exec;
var prettyjson = require('prettyjson');
var fs   	   = require('fs');


var initMining = function() {
	console.log("initMining");
	var pong = "undefined";

	var ping = setInterval(function(){
		utils.get({"event": "initMining"}, "http://107.170.245.191:9001/ping", function(body){
			console.log(utils.fullJSON(body));
			pong = body;
		});
		if (pong === "pong") {
			//were online! start mining
			exec("sudo ~/bfgminer/bfgminer -o stratum+tcp://uk1.ghash.io:3333 -u chrisgervang.worker1 -p bit -S bigpic:all", puts);
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