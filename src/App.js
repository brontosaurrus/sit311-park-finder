//Importing Requirements
import React from 'react';
import Map from 'pigeon-maps';
import Marker from 'pigeon-marker'
import NewMarker from './NewMarker.js'
import WeatherInfoComponent from'./WeatherInfoComponent';
import DashBoard from './DashBoard.js';
import './App.css';

const fetch=require('node-fetch');
const places=require('places.js');

//Define Global Constants
const WEATHER_API_KEY = 'b3a1fe31fb871a134c029733070442ae';

//Begin Appp
class App extends React.Component{
	
	//---SET STATE---
	state = {
		status : "ALL",
		parking: [],
		retrictions: [],
		events: [],
		lat: "0",
		lng: "0",
		distance: "500",
		hover: false,
		markerName: "",
		temperature: undefined,
		humidity: undefined,
		pressure: undefined,
		wind: undefined,
		cloudiness: undefined,
		selBayID: undefined,
		selRestrictions: undefined,
		selStatus: undefined,
		bayMessages: []
	}
	
	//---FETCH DATA---
	
	//Used to get data regarding where arking bays are and their current status
	//Information regarding which parking bays are currently displayed in map is then sent to fetchRestriction
	fetchParking =() => {
		let url = 'https://data.melbourne.vic.gov.au/resource/vh2v-4nfs.json?';
		if(this.state.status!=='ALL'){
			url+=`status=${this.state.status}&`
		}
		if(this.state.lat!=='0'){
			url+=`$where=within_circle(location,${this.state.lat},${this.state.lng},${this.state.distance})&`;
			this.fetchWeather();
		}
		url+='$limit=10';
		fetch(url)
			.then(response => response.json())
			.then( data => {
				let arr = this.sortParking(data);
				console.log(arr);
				this.setState({parking: arr});
			})
			.catch(error=> {
				
			});
	}
	
	//Used to find what restrictions apply to a specific parking bay
	//Information fetched from site nees to undergo some transfomrations to be able to be properly used throughout the app
	fetchRestriction = (b) => {
		let urls = [];
		var arr;
		b.map(i => {urls.push(`https://data.melbourne.vic.gov.au/resource/ntht-5rk7.json?$q=${i}`)})
		Promise.all(urls.map(url => 
			fetch(url)
				.then(response => response.json())
				.catch(error => {
					
				})
		))
		.then(data => {
			arr = data.map(i => this.sortRestriction(i));
			console.log(arr);
			this.setState({restrictions: arr});
			this.combineData();
		})	
	}
	
	//Used to find weather when the search bar is used
	fetchWeather = () => {
		fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${this.state.lat}&lon=${this.state.lng}&units=metric&appid=${WEATHER_API_KEY}`)
			.then(response => response.json())
			.then(data => {
				this.setState({
					temperature: data.main.temp,
					humidity:data.main.humidity,
					pressure:data.main.pressure,
					wind:data.wind,
					cloudiness:data.weather[0].description,
				})
			}
		)
	}
	
	//---SORT FETCH DATA---
	
	//Sort Parking data to achieved desired format
	sortParking = ( data ) => {
		var arr =[];
		var b = [];
		data.map( index => {
			const json = {
				Bay_ID: index.bay_id,
				Location: {
					Latitude: index.lat,
					Longitude: index.lon
				},
				Status: index.status,
			};
			b.push(index.bay_id)
			arr.push(json);
		})
		this.fetchRestriction(b);
		return arr;
	}
	
	//Sort Restriction Data to achie desired format
	//Because the return is only 1 object but a variety of different desciptions and from-to dates 
	//it is necessary to convert this into an array of retrictions which is what the project required.
	//Therefore the raw data is manipulated to return the Bay_ID and an array of restriction information
	//including dates, times and wether there is a meter or ticket.
	sortRestriction = ( data ) => {
		var arr =[];
		var totOut = this.totalOutput();
		data.map( obj => {		
		console.log(obj);
			var restarr = [];
			var i = 0;
			for (var key in obj){
				if (key.startsWith('descrip')){
					i+=1
				}
			}
			for (var a = 1; a<=i; a++){
				var defRes = this.defineRestriction();
				defRes.IsFree = this.descriptionRestriction(obj['description'+a]);
				defRes.Duration = {'normal':obj['duration'+a], 'disability':obj['disabilityext'+a]};
				defRes.Time = {'start':obj['starttime'+a], 'end':obj['endtime'+a]};
				defRes.Days = this.buildrange(obj['fromday'+a],obj['today'+a]);
				restarr.push(defRes);
			}
			totOut.Bay_ID = obj['bayid'];
			totOut.Restrictions = restarr;
		})
		return totOut;
	}
	
	//---SET RESTRICTION DATA TYPES---
	
	totalOutput() {
		var Bay_ID = "",
			Restrictions = [];
		return {Bay_ID: Bay_ID, Restrictions: Restrictions};
	}
	
	defineRestriction() {
		var IsFree =  "",
			Duration = {},
			Time = {},
			Days = [];
		return {IsFree: IsFree, Duration: Duration, Time: Time, Days: Days};
	}
	
	//--RESTRICTION SPECIFIC DATA MANIPULATION---
	
	//Split description to see if the bay has any relevant information regarding if it is a meter or tow area during specific times
	descriptionRestriction(des){
		var res = des.split(" ");
		if (res[1] === 'MTR'){
			return 'Meter';
		}else if (res[1] === 'TKT'){
			return 'Ticket';
		}else if (res[1] === 'TOW') {
			return 'Tow Area';
		}else{
			return 'Free';
		}
	}
	
	//Create a date array based on the specific start and finish days that a specific restriction applies.
	//eg, {fromday1: 1, today1: 5 is converted to [1,2,3,4,5]
	buildrange(start, finish) {
		var arr1 = [];
		var arr2 = [];
		var arr3 = [];
		if(finish>start){
			for (var i = start; i<=finish; i++){
				arr1.push(i);
			}
			return arr1;
		}else if (start===finish){
			arr2.push(parseFloat(start));
			return arr2
		}else{
			for (var j = 0; j<=6; j++){
				arr3.push(j);
			}
			return arr3;
		}
	}
	
	//---COMBINE DATA---
	
	//As there we two main fetch requests it is necessary to combine them together
	//Function loops through each array and matches the Bay_ID
	combineData = () => {
		console.log("Hello")
		let arr = [];
		this.state.parking.map(p => {
			this.state.restrictions.map(r => {
				if (p.Bay_ID === r.Bay_ID){
					const json = {
						Bay_ID: p.Bay_ID,
						Location: p.Location,
						Status: p.Status,
						Restrictions: r.Restrictions
					};
					arr.push(json);
				}
			});
		});
		console.log(arr);
		this.setState({events: arr});
	}
	
	//---ON CHANGE EVENTS---
	
	//If the status search change it launches the fetchParking function to update the map
	statusChanged = (e) => {
		this.setState({status:e.target.value},this.fetchParking);
	}
	
	//Hanges the distance radius for the search instead of using the fixed 500m
	sliderChange(e){
		let obj = {};
		obj[e.target.name] = e.target.value;
		console.log(JSON.stringify(obj));
		this.setState(obj, this.fetchParking);
	}
	
	//When a marker is clicked the restriction information associated with that bay is displayed
	handleClick = async({event, payload, name, anchor}) => {
		await console.log(payload.Restrictions);
		await this.setState({selBayID: payload.Bay_ID, selRestrictions: payload.Restrictions, selStatus: payload.Status})
		await console.log(this.state.selRestrictions);
	}
	
	//Launches a ToolTip showing the Bay_ID
	handleMouseOver = ({ event, name }) => {
		this.setState({ hover: true , markerName: name})
	}
	
	//Hides the ToolTip
	handleMouseOut = ({ event, name }) => {
		this.setState({ hover: false })
	}
	
	//---COMPONENT DID MOUNT---
	componentDidMount(){
		this.fetchParking();
		var placesAutoComplete = places({
			appId: 'plY0BYIMLL9G',
			apiKey: 'f14232e9f94d077e60d8007c1b05c5bb',
			container: document.querySelector('#address'),
			type: 'address'
		});
		placesAutoComplete.on('change', e => {
			this.setState({lat: e.suggestion.latlng.lat ,lng: e.suggestion.latlng.lng}, this.fetchParking);
		});
	}
	
	//---SEND POST REQUEST---
	
	//As awsiot-device-sdk is used for consoles it is not available in brower.
	//Therefore it is necessary to send a post message to the Device Broker so that they can track the parking bays
	//and send MQTT messages to AWS IOT if the status changes
	sendBayMessage = async () => {
		const rawResponse = await fetch('http://localhost:3005/start', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state.events)
		});
		const content = await rawResponse.json();
		console.log(content);
	}
	
	//---BEGIN APP---
	
	render() {
		
		//Status array for slecting parking type
		const status = ['ALL', 'Present', 'Unoccupied', ]
		
		//Stye for onHover Tooltip
		const tooltipStyle = {
			display: this.state.hover ? 'block' : 'none',
			borderColor: "white",
			borderWidth: "thick",
			borderStyle: "solid",
			background: "white"
		}
		
		return (
			<div className="App">
				<input type="search" id="address" className="form-control" placeholder="Where are we going?" />
				<div className="slidecontainer">
					<input type="range" min="1" max="1000" name='distance' value={this.state.distance} className="slider" id="myRange" onChange={(e) => {this.sliderChange(e)}}/>
				</div>
				
				<div className="App-content">
					<WeatherInfoComponent 
						temperature={this.state.temperature}
						humidity={this.state.humidity}
						pressure={this.state.pressure}
						wind={this.state.wind}
						cloudiness={this.state.cloudiness}/>
					<DashBoard bayid={this.state.selBayID} restriction={this.state.selRestrictions} status={this.state.selStatus}/>
					<input type="button" onClick={this.sendBayMessage} value={'sendBayMessage'}/>
				</div>
				
				<header className="App-header">
					<Map center={[-37.8470585,145.1145445]} zoom={12} width={600} height={400} >
						<Marker anchor={[-37.8470585,145.1145445]} payload={1} onClick={this.handleClick} />
						{this.state.events.map(i=> (<NewMarker anchor={[parseFloat(i.Location.Latitude),parseFloat(i.Location.Longitude)]} status={i.Status} key={i.Bay_ID} name={i.Bay_ID} payload={i} onClick={this.handleClick} onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}/>))}
						<div>
							<div style={tooltipStyle} className="tooltip" >{this.state.markerName}</div>
						</div>
					</Map>
					
					<label>Status</label>
					<select onChange={this.statusChanged} value={this.state.status}>
						{status.map(i=>(<option key={i} value={i}>{i}</option>))}
					</select>
				</header>
			</div>
		)
	}
}

export default App;
