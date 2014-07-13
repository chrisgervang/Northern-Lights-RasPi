var tell = function (request, reply) {
	var device = request.payload.device;
	currentCheckQueue.push(device);
	reply("We see you're online!").code(200);



}

var currentCheckQueue = [];

module.exports = {
	currentCheckQueue: currentCheckQueue,
	tell: tell
}
/*
{
	"device": {
		"id": "*device id*",
		"online": true
	}
}*/