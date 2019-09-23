//List Requirements
const awsIot = require('aws-iot-device-sdk')
const fetch=require('node-fetch');

//Establish Device
const device1 = awsIot.device({
	certPath: './parkingCert/parking1/8d6c71549c-certificate.pem.crt',
	keyPath: './parkingCert/parking1/8d6c71549c-private.pem.key',
	caPath: './parkingCert/parking1.pem',
	clientId: 'parking1',
	host: 'a1xk7thsjhw39b-ats.iot.us-east-1.amazonaws.com'
});

//Set variables
let state = {bayID:'0', status:'0', restriction:'0'};
let isConnected=false;
let timeout=null;

var dateNow = new Date();

//Functions to write MQTT
function startSimulation1(i){
	if(isConnected){
		state.bayID = i;
		console.log('parking1 is: '+ i);
		sendMQTTMessage(i);
	}else{
		setTimeout(startSimulation1, 1000);
		console.log('not connected');
	}
}

function stopSimulation(){
	clearTimeout(timeout);
}

sendMQTTMessage = async(i) => {
	var origStatus = state.status;
	await fetchParking(i);
	var newStatus = state.status;
	if (origStatus !== newStatus){	
		await fetchRestriction(i)
		await device1.publish('parking1', JSON.stringify(state));
	}
	timeout = setTimeout(sendMQTTMessage, 1000);
}

fetchParking = async(id) => {
	let url = `https://data.melbourne.vic.gov.au/resource/vh2v-4nfs.json?bay_id=${id}`;
	await fetch(url)
		.then(async response => response.json())
		.then( async data => {
			state.status = data[0].status;
		})
		.catch(async error=> {
			
		});
}

checkDateTime = (data) => {
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

fetchRestriction = async(id) => {
	let a = "";
	let url = `https://data.melbourne.vic.gov.au/resource/ntht-5rk7.json?$q=${id}`;
	await fetch(url)
		.then(async response => response.json())
		.then( async data => {
			await checkDateTime(data[0]);
		})
		.catch(async error=> {
			
		});
}

//Action for device
device1
	.on('connect', () => {
		console.log('connected parking1');
		isConnected=true;
		device1.subscribe('parking1');
	}
);

device1
	.on('message', (topic, payload) => {
		console.log('message', topic, payload.toString());
	}
);

module.exports = {
	state: state,
	startSimulation1: startSimulation1, 
	stopSimulation: stopSimulation
}