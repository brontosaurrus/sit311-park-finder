//List Requirements
const awsIot = require('aws-iot-device-sdk')
//const bay1 = require('./bayInfo.js')

//Establish Device
const device = awsIot.device({
	certPath: './parkingCert/parking9/caa6a8029a-certificate.pem.crt',
	keyPath: './parkingCert/parking9/caa6a8029a-private.pem.key',
	caPath: './parkingCert/parking1.pem',
	clientId: 'lachlan',
	host: 'a1xk7thsjhw39b-ats.iot.us-east-1.amazonaws.com'
});

//Set variables
let state = {bayID:'0', status:'0', restriction_duration:0};
let isConnected=false;
let timeout=null;

//Functions to write MQTT
function startSimulation(){
	if(isConnected){
		sendMQTTMessage();
	}else{
		setTimeout(startSimulation, 1000);
		console.log('not connected');
	}
}

function stopSimulation(){
	clearTimeout(timeout);
}

function sendMQTTMessage(){
	//state.bayID = bay1.bayID
	//state.status = bay1.status
	//state.restriction_duration = bay1.restrictions[0].duration
	device.publish('parking9', JSON.stringify(state));
	timeout = setTimeout(sendMQTTMessage, 1000);
}

//start simulation
startSimulation()

//Action for device
device
	.on('connect', () => {
		console.log('connected');
		device.publish('test', 'hello parking1');
		isConnected=true;
		device.subscribe('parking9');
	}
);

device
	.on('message', (topic, payload) => {
		console.log('message', topic, payload.toString());
	}
);

module.exports = {
	
}