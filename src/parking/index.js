var express = require('express');
var parking1 = require('./parking1.js');
var parking2 = require('./parking2.js');
var parking3 = require('./parking3.js');
var parking4 = require('./parking4.js');
var parking5 = require('./parking5.js');
var parking6 = require('./parking6.js');
var parking7 = require('./parking7.js');
var parking8 = require('./parking8.js');
var parking9 = require('./parking9.js');
var parking10 = require('./parking10.js');

const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

var parkArray = [10];
parkArray[0]=parking1;
parkArray[1]=parking2;
parkArray[2]=parking3;
parkArray[3]=parking4;
parkArray[4]=parking5;
parkArray[5]=parking6;
parkArray[6]=parking7;
parkArray[7]=parking8;
parkArray[8]=parking9;
parkArray[9]=parking10;


app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/start', (req, res) => {
	let arr = req.body;
	for (let i = 0; i< arr.length; i++){
		if(i===0){
			parkArray[i].startSimulation1(arr[i].Bay_ID);
		}else if(i===1){
			parkArray[i].startSimulation2(arr[i].Bay_ID);
		}else if(i===2){
			parkArray[i].startSimulation3(arr[i].Bay_ID);
		}else if(i===3){
			parkArray[i].startSimulation4(arr[i].Bay_ID);
		}else if(i===4){
			parkArray[i].startSimulation5(arr[i].Bay_ID);
		}else if(i===5){
			parkArray[i].startSimulation6(arr[i].Bay_ID);
		}else if(i===6){
			parkArray[i].startSimulation7(arr[i].Bay_ID);
		}else if(i===7){
			parkArray[i].startSimulation8(arr[i].Bay_ID);
		}else if(i===8){
			parkArray[i].startSimulation9(arr[i].Bay_ID);
		}else if(i===9){
			parkArray[i].startSimulation10(arr[i].Bay_ID);
		}
		
	}
	return res.send('Simulation is started');
	
});

app.listen(3005, () => {
	console.log('Example app listening on port 3005!');
});
