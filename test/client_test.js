var Client = require('../lib/client.js');

var options = {
	hostname: null
}

var client = new Client(options);

client.request(console.log);

