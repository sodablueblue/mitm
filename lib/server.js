var http = require('http');

function HttpServer(port){
	this.port = port || 80;
	this.data = '';
}

HttpServer.prototype.start = function(cb){
	var server = http.createServer(function(req, res){
		if(req.method == 'POST' || req.method == 'PUT'){
			req.on('data', function(data){
				this.data += data.toString();
			});

			req.on('end', function(){
				cb(this.data);
			});

			req.on('error', function(e){
				console.log(e);
			});
		}

		res.end('<p>MITM server start</p>');
	});

	server.listen(this.port);
};

module.exports = HttpServer;