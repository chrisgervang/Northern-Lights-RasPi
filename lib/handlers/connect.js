var exec        = require('child_process').exec;
var spawn       = require('child_process').spawn;
var prettyjson  = require('prettyjson');
var fs          = require('fs');
var sys         = require('sys');
var puts        = function(error, stdout, stderr) { sys.puts(stdout) }
var utils       = require('../utils.js');
var _           = require('lodash');
var jf          = require('jsonfile');
var initMining  = require('../mining.js').initMining;
var colors      = require('colors');

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

// Add the route
var connect = function (request, reply) {
  var credentials = request.payload;
  console.log(credentials+''.help);

  var client = exec('sudo sh ../sh/client.sh wlan1 \"' + credentials.ssid + '\" ' + credentials.password + ' wlan0');

  client.stdout.on('data', function(data) {
    console.log('stdout: '+data+''.info);

    var tail = spawn('tail', ['-f', '-n', '1', "/var/log/syslog"]);
    
    //look for success or fail logs.
    tail.stdout.on('data', function (data) {
      var lines = data.toString('utf-8').split('\n');
      //console.log("LINES: ", lines)
      _.forEach(lines, function(line){
        var line = line.split(' raspberrypi ')[1];
        if (!!line) {
          //console.log(line);
          
          //If success, reply success. Save credentials in a new file called "settings.conf".
          if(_.contains(line, "dhclient: bound to ")) {
            //the connection was a success!
            console.log("connected to " + credentials.ssid+''.silly);
            var settings = { ssid: credentials.ssid, password: credentials.password, persist: true };
            var file = "../../settings.json";

            jf.writeFile(file, settings, function(err) {
              console.log(err+''.error);
              console.log("settings files saved".debug);
            });

            reply("client connected").code(200);
          
          //If fail, reply fail. Also reset client script to get it back to the "AP only" state.
          } else if(_.contains(line, "wlan1: WPA: 4-Way Handshake failed - pre-shared key may be incorrect")) {
            var ifdown = exec("sudo ifdown wlan1");
            console.log("incorrect password".error);
            ifdown.on('exit', function () { 
              reply("incorrect password").code(200);
              console.log('ifdown wlan1 ended!'.debug); 
            });
          }
        }
      });
    });

    process.on('exit', function () {
        console.log("tail killed on exit".info);
        tail.kill();
    });
    
  });

  client.stderr.on('data', function(data) {
      console.log('stderr: '+data+''.error);
  });
  client.on('exit', function () { 
    var miningState = require('../mining.js').miningState;
    if (miningState === false) {
      setTimeout(function(){initMining()}, 4000);
    };
    
    console.log('client ended!'.info); 
  });
}

module.exports = connect;
