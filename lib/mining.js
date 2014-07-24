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
      //  console.log('  mining stdout: ' + data);
      // });

      mining.stderr.on('data', function(data) {
          console.log('  mining stderr: ' + data);
      });
      mining.on('exit', function () { 
        // if (mining === false) {
        //  initMining();
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

module.exports = {
  miningState: mining,
  initMining: initMining
};