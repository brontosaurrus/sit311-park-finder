//Importing Requirements
import React from 'react';
import Map from 'pigeon-maps';
import Marker from 'pigeon-marker'
import NewMarker from './NewMarker.js'
import WeatherInfoComponent from'./WeatherInfoComponent';
import DashBoard from './DashBoard.js';
import './App.css';

//Define Global Constants
const fetch=require("node-fetch");
const places=require('places.js');
const WEATHER_API_KEY = 'b3a1fe31fb871a134c029733070442ae';

class App extends React.Component{
	
	//Set State
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
		selLocation: undefined,
		selStatus: undefined,
		selRestrctions: []
	}
	
	//Fetch Data
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
	
	fetchRestriction = async(b) => {
		let urls = [];
		b.map(i => {urls.push(`https://data.melbourne.vic.gov.au/resource/ntht-5rk7.json?$q=${i}`)})
		Promise.all(urls.map(url => 
			fetch(url)
				.then(response => response.json())
				.catch(error => {
					
				})
		))
		.then(data => {
			let arr = this.sortRestriction(data);
			this.setState({restrictions: arr});
			this.combineData();
		});	
	}
	
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
	
	//Combine Data
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
						Restrictions: {
							IsFree: r.IsFree,
							Duration: r.Duration,
							Effectiveonph: r.effectiveonph,
							Time: r.Time,
							Days: r.days
						}
					};
					arr.push(json);
				}
			});
		});
		console.log(arr);
		this.setState({events: arr});
	}
	
	//Sort Fetch Data
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
	
	sortRestriction = ( data ) => {
		var arr =[];
		data.map( index => {
			const json = {
				Bay_ID: index[0].bayid,
				IsFree : "Add Function here",
				Duration : index[0].duration1,
				effectiveonph : index[0].effectiveonph,
				Time : {start: index[0].starttime1, end : index[0].endtime1 },
				Days : index[0].today1
			}
			arr.push(json);
		})
		console.log(arr)
		return arr;
	}
	
	//On Change
	statusChanged = (e) => {
		this.setState({status:e.target.value},this.combineData);
	}
	
	sliderChange(e){
		let obj = {};
		obj[e.target.name] = e.target.value;
		console.log(JSON.stringify(obj));
		this.setState(obj);
	}
	
	handleClick = ({event, payload, name, anchor}) => {
		console.log(`Marker #${JSON.stringify(payload)} clicked at: `, anchor);
		this.setState({selBayID: payload.Bay_ID, selLocation: payload.Location, selStatus: payload.Status})
	}
	
	handleMouseOver = ({ event, name }) => {
		this.setState({ hover: true , markerName: name})
	}
	
	handleMouseOut = ({ event, name }) => {
		this.setState({ hover: false })
	}
	
	//Component Did Mount
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
	
	render() {
		const status = ['ALL', 'Present', 'Unoccupied', ]
		
		const tooltipStyle = {
			display: this.state.hover ? 'block' : 'none',
			borderColor: "white",
			borderWidth: "thick",
			borderStyle: "solid",
			background: "black"
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
					<DashBoard bayid={this.state.selBayID} location={this.state.selLocation} status={this.state.selStatus}/>
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
