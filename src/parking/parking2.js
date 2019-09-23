//List Requirements
const awsIot2 = require('aws-iot-device-sdk')
const fetch=require('node-fetch');
//const bay1 = require('./bayInfo.js')

//Establish Device
const device2 = awsIot2.device({
	certPath: './parkingCert/parking2/e8d1cfb856-certificate.pem.crt',
	keyPath: './parkingCert/parking2/e8d1cfb856-private.pem.key',
	caPath: './parkingCert/parking1.pem',
	clientId: 'parking2',
	host: 'a1xk7thsjhw39b-ats.iot.us-east-1.amazonaws.com'
});

//Set variables
let state = {bayID:'0', status:'0', restriction:'0'};
let isConnected=false;
let timeout=null;

var dateNow = new Date();

//Functions to write MQTT
function startSimulation2(i){
	if(isConnected){
		state.bayID = i;
		console.log('parking2 is: '+ i);
		sendMQTTMessage2(i);
	}else{
		setTimeout(startSimulation2, 1000);
		console.log('not connected');
	}
}

function stopSimulation(){
	clearTimeout(timeout);
}

sendMQTTMessage2 = async(i) => {
	var origStatus = state.status;
	await fetchParking2(i);
	var newStatus = state.status;
	if (origStatus !== newStatus){	
		await fetchRestriction2(i)
		await device2.publish('parking2', JSON.stringify(state));
	}
	timeout = setTimeout(sendMQTTMessage2, 1000);
}

fetchParking2 = async(id) => {
	let url = `https://data.melbourne.vic.gov.au/resource/vh2v-4nfs.json?bay_id=${id}`;
	await fetch(url)
		.then(async response => response.json())
		.then( async data2 => {
			state.status = data2[0].status;
		})
		.catch(async error=> {
			
		});
}

checkDateTime2 = (data) => {
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

fetchRestriction2 = async(id) => {
	let a = "";
	let url = `https://data.melbourne.vic.gov.au/resource/ntht-5rk7.json?$q=${id}`;
	await fetch(url)
		.then(async response => response.json())
		.then( async data => {
			await checkDateTime2(data[0]);
		})
		.catch(async error=> {
			
		});
}


//Action for device
device2
	.on('connect', () => {
		console.log('connected parking2');
		device2.publish('test', 'hello parking1');
		isConnected=true;
		device2.subscribe('parking2');
	}
);

device2
	.on('message', (topic, payload) => {
		console.log('message', topic, payload.toString());
	}
);


module.exports = {
	state: state,
	startSimulation2: startSimulation2, 
	stopSimulation: stopSimulation
}