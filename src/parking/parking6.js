//List Requirements
const awsIot = require('aws-iot-device-sdk')
const fetch=require('node-fetch');
//const bay1 = require('./bayInfo.js')

//Establish Device
const device = awsIot.device({
	certPath: './parkingCert/parking6/6ada82c863-certificate.pem.crt',
	keyPath: './parkingCert/parking6/6ada82c863-private.pem.key',
	caPath: './parkingCert/parking1.pem',
	clientId: 'parking6',
	host: 'a1xk7thsjhw39b-ats.iot.us-east-1.amazonaws.com'
});

//Set variables
let state = {bayID:'0', status:'0', restriction:'0'};
let isConnected=false;
let timeout=null;

//Functions to write MQTT
function startSimulation6(i){
	if(isConnected){
		state.bayID = i;
		console.log('parking6 is: '+ i);
		sendMQTTMessage6(i);
	}else{
		setTimeout(startSimulation6, 1000);
		console.log('not connected');
	}
}

function stopSimulation(){
	clearTimeout(timeout);
}

sendMQTTMessage6 = async(i) => {
	var origStatus = state.status;
	await fetchParking6(i);
	var newStatus = state.status;
	if (origStatus !== newStatus){	
		await fetchRestriction6(i)
		await device.publish('parking6', JSON.stringify(state));
	}
	timeout = setTimeout(sendMQTTMessage6, 1000);
}

fetchParking6 = async(id) => {
	let url = `https://data.melbourne.vic.gov.au/resource/vh2v-4nfs.json?bay_id=${id}`;
	await fetch(url)
		.then(async response => response.json())
		.then( async data => {
			state.status = data[0].status;
		})
		.catch(async error=> {
			
		});
}

checkDateTime6 = (data) => {
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

fetchRestriction6 = async(id) => {
	let a = "";
	let url = `https://data.melbourne.vic.gov.au/resource/ntht-5rk7.json?$q=${id}`;
	await fetch(url)
		.then(async response => response.json())
		.then( async data => {
			await checkDateTime6(data[0]);
		})
		.catch(async error=> {
			
		});
}

//Action for device
device
	.on('connect', () => {
		console.log('connected parking6');
		device.publish('test', 'hello parking1');
		isConnected=true;
		device.subscribe('parking6');
	}
);

device
	.on('message', (topic, payload) => {
		console.log('message', topic, payload.toString());
	}
);

module.exports = {
	state: state,
	startSimulation6: startSimulation6, 
	stopSimulation: stopSimulation
}