var ip = require('ip');
var getmac = require('getmac').getMac;
var defer = require('q').defer();
var pcap = require('pcap');

function ArpPkg(options){
	this.interfaceSet = false;
	this.session = null;
	this.eh_dst = options.eh_dst || 'ff:ff:ff:ff:ff:ff';
	this.eh_src = options.eh_src || 'ff:ff:ff:ff:ff:ff'; // src mac
	this.eh_type = options.eh_type || [0x08, 0x06];
	this.hw_type = options.hw_type || [0x00, 0x01];
	this.arp_proto = options.arp_proto || [0x08, 0x00];
	this.mac_length = options.mac_length || [0x06];
	this.ip_length = options.ip_length || [0x04];
	this.opcode = options.opcode || [0x00, 0x02]; // 0x01 request; 0x02 reply
	this.src_mac = options.src_mac || 'ff:ff:ff:ff:ff:ff'; // src mac
	this.src_ip = options.src_ip || '192.168.0.1';			// src ip
	this.dst_mac = options.dst_mac || 'ff:ff:ff:ff:ff:ff';
	this.dst_ip = options.dst_ip || '192.168.0.2';
	this.arpPkg = [];
};

ArpPkg.prototype.setInterface = function(interface){
	try{
		this.session = pcap.createSession(interface, '');
		this.interfaceSet = true;
		console.log('Set interface to ' + (interface == null ? 'Default' : interface));
	}catch(e){
		this.interfaceSet = false;
		console.error('ERROR: Interface set error. ' + e);
		process.exit(1);
	}
};

ArpPkg.prototype.send = function(cb){
	if(!this.interfaceSet){
		this.setInterface(null);
	}

	var arp = this;

	function loadMac(srcMac){
		arp.arpPkg.eh_dst = mac_to_arr(arp.eh_dst);
		arp.arpPkg.eh_src = mac_to_arr(srcMac);
		arp.arpPkg.eh_type = arp.eh_type;
		arp.arpPkg.hw_type = arp.hw_type;
		arp.arpPkg.arp_proto = arp.arp_proto;
		arp.arpPkg.mac_length = arp.mac_length;
		arp.arpPkg.ip_length = arp.ip_length;
		arp.arpPkg.opcode = arp.opcode;
		arp.arpPkg.src_mac = mac_to_arr(srcMac);
		arp.arpPkg.src_ip = ip_to_arr(arp.src_ip);
		arp.arpPkg.dst_mac = mac_to_arr(arp.dst_mac);
		arp.arpPkg.dst_ip = ip_to_arr(arp.dst_ip);
		return arp;
	}

	function stringifyPkg(pkg){
		var arr = [];
		for( x in pkg.arpPkg){
			arr = arr.concat(pkg.arpPkg[x]);
		}

		var buf = new Buffer(arr, 'hex');
		return buf;
	}

	function send(srcMac){
		var arp = loadMac(srcMac);
		var buf = stringifyPkg(arp);
		console.log('Buf: ', buf);
		arp.session.inject(buf);
		console.log('ARP sent.');
		cb();
	}

	getMac();
	defer.promise.then(send, console.log);
};

function ip_to_arr(ipAddr){
	var arr = ipAddr.split('.');
	var x;
	for (x in arr){
		arr[x] = arr[x];
	}
	return arr;
}

function mac_to_arr(macAddr){
	var arr = macAddr.split(':');
	var x;
	for ( x in arr){
		arr[x] = '0x' + arr[x];
	}
	return  arr;
}

function getMac(){
	return getmac(function(err, macAddr){
		if(err) defer.reject(err);
		console.log('Src MAC: ', macAddr);
		defer.resolve(macAddr);
	});
}

module.exports = ArpPkg;
