var http = require('http');

function HttpClient(options){
	this.options = {};
	this.options.hostname = options.hostname || '127.0.0.1';
	this.options.port = options.port || 80;
	this.options.path = options.path || '/';
	this.options.method = options.method || 'GET';
	this.options.headers = options.headers || {'Content-Type': 'application/x-www-form-urlencoded'};
	this.data = '';
};

HttpClient.prototype.loadData = function(data){
	this.data = JSON.stringify(data);
};

HttpClient.prototype.request = function(cb){
	var body = '';
	var req = http.request(this.options, function(res){
		res.setEncoding('utf8');
		res.on('data', function(chunk){
			body += chunk.toString();
		});

		res.on('end', function(){
			cb(body);
		});

		res.on('error', function(e){
			console.log('ERROR: ', e);
			process.exit(1);
		});
	});

	if(/^PUT|POST$/i.test(this.options.method.trim())){
		req.write(this.data);
	}

	req.end();
};

module.exports = HttpClient;