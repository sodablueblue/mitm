var Client = require('../lib/client.js');

var options = {
	hostname: '127.0.0.1'
}

var client = new Client(options);

client.request(console.log);

