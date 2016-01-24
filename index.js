var ArpPkg = require('./lib/arp.js');

var options = {
	dst_ip: '192.168.1.104',
	dst_mac: '5c:e0:c5:75:31:ef',
	eh_dst: '5c:e0:c5:75:31:ef',
	src_ip: '192.168.1.103'
};

var arp = new ArpPkg(options);
arp.send(a);

function a(){
	process.exit(1);
}