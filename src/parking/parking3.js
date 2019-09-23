//List Requirements
const awsIot = require('aws-iot-device-sdk')
const fetch=require('node-fetch');
//const bay1 = require('./bayInfo.js')

//Establish Device
const device = awsIot.device({
	certPath: './parkingCert/parking3/4be8aac43b-certificate.pem.crt',
	keyPath: './parkingCert/parking3/4be8aac43b-private.pem.key',
	caPath: './parkingCert/parking1.pem',
	clientId: 'parking3',
	host: 'a1xk7thsjhw39b-ats.iot.us-east-1.amazonaws.com'
});

//Set variables
let state = {bayID:'0', status:'0', restriction:'0'};
let isConnected=false;
let timeout=null;

var dateNow = new Date();

//Functions to write MQTT
function startSimulation3(i){
	if(isConnected){
		state.bayID = i;
		console.log('parking3 is: '+ i);
		sendMQTTMessage3(i);
	}else{
		setTimeout(startSimulation3, 1000);
		console.log('not connected');
	}
}

function stopSimulation(){
	clearTimeout(timeout);
}

sendMQTTMessage3 = async(i) => {
	var origStatus = state.status;
	await fetchParking3(i);
	var newStatus = state.status;
	if (origStatus !== newStatus){	
		await fetchRestriction3(i)
		await device.publish('parking3', JSON.stringify(state));
	}
	timeout = setTimeout(sendMQTTMessage3, 1000);
}

fetchParking3 = async(id) => {
	let url = `https://data.melbourne.vic.gov.au/resource/vh2v-4nfs.json?bay_id=${id}`;
	await fetch(url)
		.then(async response => response.json())
		.then( async data => {
			state.status = data[0].status;
		})
		.catch(async error=> {
			
		});
}

checkDateTime3 = (data) => {
	var h = dateNow.getHours();
	var d = dateNow.getDay();
	var i = 0;
	for (var key in data){
		if (key.startsWith('descrip')){
			i+=1
		}
	}
	for (var a = 1; a<=i; a++){
		let st = data['starttime'+a].split(':');
		let st0 = parseFloat(st[0]);
		let ft = data['endtime'+a].split(':');
		let ft0 = parseFloat(ft[0]);
		let sd = data['fromday'+a];
		let fd = data['today'+a];
		if(h > st0 && h < ft0 && d >= sd && d <= fd){
			state.restriction = data['description'+a];
		}
	}
}

fetchRestriction3 = async(id) => {
	let a = "";
	let url = `https://data.melbourne.vic.gov.au/resource/ntht-5rk7.json?$q=${id}`;
	await fetch(url)
		.then(async response => response.json())
		.then( async data => {
			await checkDateTime3(data[0]);
		})
		.catch(async error=> {
			
		});
}

//Action for device
device
	.on('connect', () => {
		console.log('connected parking3');
		device.publish('test', 'hello parking1');
		isConnected=true;
		device.subscribe('parking3');
	}
);

device
	.on('message', (topic, payload) => {
		console.log('message', topic, payload.toString());
	}
);

module.exports = {
	state: state,
	startSimulation3: startSimulation3, 
	stopSimulation: stopSimulation
}