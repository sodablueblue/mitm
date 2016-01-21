var spawn = require('child_process').spawn;

function Arptable(){
	this.arp_string = '';
	this.arp_arr = [];
}

Arptable.prototype.getArpTable = function(cb){
	var arp = spawn('arp', ['-a']);
	var arp_str = '';

	arp.stdout.setEncoding('utf8');
	arp.stdout.on('data', function(data){
		arp_str += data.toString();
	});

	arp.stdout.on('end', function(){
		this.arp_string = arp_str;
		this.arp_arr = parse_arp_table(arp_str);
		cb(this.arp_arr);
	});

	arp.stdout.on('error', function(e){
		console.log(e);
	});

	function parse_arp_table(arpStr){
		var resVal = [];
		var arpArr = arpStr.split('\r');

		var ipArr = arpStr.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/gi);
		// Pop out the first ip
		ipArr.pop();
		var macArr = arpStr.match(/([0-9a-fA-F]{1,2}-){5}[0-9a-fA-F]/gi);

		for(var i = 0; i < ipArr.length; i++){
			resVal.push({ip: ipArr[i], mac: macArr[i]});
		}

		return resVal;
	}
};

module.exports = Arptable;