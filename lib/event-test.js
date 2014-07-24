var EventSource = require('eventsource');
var utils       = require('./utils.js');
// var es = new EventSource('http://10.0.1.14:9000/sse');
var es          = new EventSource('http://192.168.42.96:9000/sse');
// es.onmessage = function(e) {
//   console.log(e.data);
// };
es.addEventListener('check', function(e) {
  console.log(e.data); // XXX
  var data = {
    "device": {
      "id": "-JMyPwLPvN3oOPdZO8OY",
      "online": true
    }
  }
  utils.post(data, 'http://192.168.42.96:9000/miners/tell', function(){
    console.log("Connection Status Success!... I think");
  });
}, false);
es.onerror = function() {
  console.log('ERROR!');
};