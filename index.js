var Hapi        = require('hapi');
var sys         = require('sys');
var fs          = require('fs');
var exec        = require('child_process').exec;
var spawn       = require('child_process').spawn;
var prettyjson  = require('prettyjson');
var connect     = require('./lib/handlers/connect.js');
var networks    = require('./lib/handlers/networks.js');
var puts        = function(error, stdout, stderr) { sys.puts(stdout) }
var EventSource = require('eventsource');
var _           = require('lodash');
var jf          = require('jsonfile');
//require("./check-online.js");
var initMining  = require('./lib/mining.js').initMining;





var initAccess = function() {
  
  //  On startup, check for settings.conf and either set up an AP or just connect to a client with those creds.

  var file = './settings.json';
  jf.readFile(file, function(err, credentials) {
    console.log(err, credentials); 

    if (!err) {
      //file exists and we should start up a client
      var client = exec('sudo sh ./client.sh wlan1 \"' + credentials.ssid + '\" ' + credentials.password + ' wlan0');
      
      client.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
      });

      client.stderr.on('data', function(data) {
          console.log('stderr: ' + data);
      });
      
      client.on('exit', function () { 
        var miningState = require('./lib/mining.js').miningState;
        if (miningState === false) {
          setTimeout(function(){initMining()}, 4000);
        }
        console.log('client ended!'); 
      });

    } else {
      //error with persistent file, so lets boot up the onboarding way!
    
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

var tail = spawn('tail', ['-f', '-n', '1', "/var/log/syslog"]);

tail.stdout.on('data', function (data) {
  var lines = data.toString('utf-8').split('\n');
  _.forEach(lines, function(line){
    var line = line.split(' raspberrypi ')[1];
    if (!!line) {
      console.log(line);
    }
  });
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

