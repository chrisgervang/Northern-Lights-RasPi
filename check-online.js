//This responds to a SSE where "event: check-online" by POSTing to firebase and/or POSTing back to the SSE server that this device is online.

var EventSource = require('eventsource');
var utils 		= require('./utils.js');


//POST to server that this is online
var callServer = function (payload) {
	utils.post(payload, "http://107.170.245.191:9000/device_call", function(){

	});
}


//event source implementation for "event: check-online"
var es = new EventSource('http://107.170.245.191:9000/sse');
es.onmessage = function(e) {
  if (!!e.event) {
  	console.log(e, "event: ", e.event, "data: ", e.data);
  };
  
};