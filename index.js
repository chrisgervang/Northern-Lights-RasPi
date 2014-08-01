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
var initMining  = require('./lib/mining.js').initMining;
var colors      = require('colors');
var Primus      = require('primus');

var Socket = Primus.createSocket({ transformer: 'engine.io' });

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});
//require("./check-online.js");

// outputs red text
console.log("this is an error".error);

// outputs yellow text
console.log("this is a warning".warn);
var onboarding = true;
var creds;
var initAccess = function() {
  
  //  On startup, check for settings.conf and either set up an AP or just connect to a client with those creds.

  var file = './settings.json';
  
  jf.readFile(file, function(err, credentials) {
    // console.log(err, credentials); 
    creds = credentials;
    if (!err) {
      onboarding = false;
      //file exists and we should start up a client
      var client = exec('sudo sh /home/pi/NL-Pi/lib/sh/client.sh wlan1 \"' + credentials.ssid + '\" ' + credentials.password + ' wlan0');
      
      client.stdout.on('data', function(data) {
        console.log(('stdout: '+data).info);
      });

      client.stderr.on('data', function(data) {
          console.log(('stderr: '+data).error);
      });
      
      client.on('exit', function () { 
        console.log('client ended!'.info); 
      });

    } else {
      //error with persistent file, so lets boot up the onboarding way!
    
      //init access point
      console.log("Tried to spawn ap".warn);
      var ap = exec('sudo sh /home/pi/NL-Pi/lib/sh/ap.sh wlan0');

      ap.stdout.on('data', function(data) {
        console.log(('stdout: '+data).info);
      });

      ap.stderr.on('data', function(data) {
          console.log(('stderr: '+data).error);
      });
      
      ap.on('exit', function () { 
        console.log('ap ended!'.info); 
        initServer();   
      });
    }
  });
}
// exec("sudo ifconfig wlan0 down", puts);
// exec("sudo ifconfig wlan1 down", puts);
setTimeout(function(){initAccess()}, 1500);

console.log("watching file".debug);

var tail = spawn('tail', ['-f', '-n', '1', "/var/log/syslog"]);

tail.stdout.on('data', function (data) {
  var lines = data.toString('utf-8').split('\n');
  _.forEach(lines, function(line){
    var line = line.split(' raspberrypi ')[1];
    if (!!line) {
      console.log((line).data);

      //If success, reply success. Save credentials in a new file called "settings.conf".
      if(_.contains(line, "dhclient: bound to ") && onboarding === false) {
        //the connection was a success!
        console.log(("connected to " + creds.ssid).info);
        var miningState = require('./lib/mining.js').miningState;
        if (miningState === false) {
          setTimeout(function(){initMining()}, 1000);
        };

        var killeth0 = exec("sudo ifdown eth0");

        killeth0.stdout.on('data', function(data) {
          console.log(('stdout: '+data).info);
        });
        tail.kill();


        var client = new Socket('http://107.170.245.191:9000');

        client.on('open', function open() {
          console.log('Connection is alive and kicking');
          client.write({id: "q1"});
        });

        client.on('data', function message(data) {
          console.log('Received a new message from the server', data);
          if (data === "reset") {
            var reset = spawn("sudo sh",["/home/pi/NL-Pi/lib/sh/reset.sh"], {detached: true});
            reset.stdout.on('data', function(data) {
              console.log(('stdout: '+data).info);
            });

            reset.stderr.on('data', function(data) {
                console.log(('stderr: '+data).error);
            });
            
            reset.on('exit', function () { 
              console.log('reset ended!'.info);    
            });
          }
        });

        //reply("client connected").code(200);
      
      //If fail, reply fail. Also reset client script to get it back to the "AP only" state.
      } else if(_.contains(line, "wlan1: WPA: 4-Way Handshake failed - pre-shared key may be incorrect") && onboarding === false) {
        var ifdown = exec("sudo ifdown wlan1");
        console.log("incorrect password".error);
        ifdown.on('exit', function () { 
          //reply("incorrect password").code(200);
          console.log('ifdown wlan1 ended!'.debug); 
          tail.kill();
        });
      } else if(_.contains(line, ": Accepted ")){
        console.log("new pool work!".info);
      }
    }
  });
});

process.on('exit', function () {
  tail.kill();
});
process.on('SIGTERM', function(msg) {
    tail.kill();
});


var initServer = function() {
  console.log("init server".debug);
  // Create a server with a host and port
  var server = Hapi.createServer('10.4.20.1', 8000);

  server.route([
    { method: 'GET', path: '/{path*}', handler: {
            directory: { path: '/home/pi/NL-Pi/public/', listing: true, index: true }
        }
    },{ method: 'POST', path: '/connect', handler: connect 
    },{ method: 'GET', path: '/ping', handler: function(request, reply){
        reply('pong');
      }
    },{
      method: 'GET', path: '/networks', handler: networks
    },{
      method: 'GET', path: '/id', handler: function(request, reply){
        fs.readFile('/home/pi/config.txt', function(err, data) {
            if(err) throw err;
            var id = data.toString();
            reply(id).code(200);
        });
      }
    },{
      method: 'GET', path: '/reset', handler: function(request, reply) {
        var reset = spawn("./home/pi/NL-Pi/lib/sh/reset.sh", {detached: true});
        reset.stdout.on('data', function(data) {
          console.log(('stdout: '+data).info);
        });

        reset.stderr.on('data', function(data) {
            console.log(('stderr: '+data).error);
        });
        
        reset.on('exit', function () { 
          console.log('reset ended!'.info);    
        });
        reply("reseting!").code(200);
      }
    }
  ]);
  console.log("init routes".debug);

  // Start the server
  server.start();
  console.log("start server".debug);
}

