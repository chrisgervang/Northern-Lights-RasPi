var Hapi = require('hapi');

// Create a server with a host and port
var server = Hapi.createServer('192.168.1.74', 8000);

// Add the route
var connect = function (request, reply) {
	var credentials = request.payload;
	console.log("hi!", credentials);
	reply('connected!');
}

server.route([{
    method: 'GET', path: '/{path*}', handler: {
	        directory: { path: './public', listing: false, index: true }
	    }
	},{ method: 'POST', path: '/connect', handler: connect }]);

// Start the server
server.start();