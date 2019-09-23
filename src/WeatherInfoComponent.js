import React from 'react';

class WeatherInfoComponent extends React.Component {

	render() {
		return (
			//<React.Fragment>
				//<p>{JSON.stringify(this.props.weather)}</p>
			//</React.Fragment>
			<div>
				{this.props.city && <p>Location:  {this.props.city}</p>}
				{this.props.temperature && <p><b>Temperature </b>  {this.props.temperature} °C</p>}
				{this.props.humidity && <p><b> Humidity </b>{this.props.humidity} %</p>}
				{this.props.pressure && <p><b>Pressure </b> {this.props.pressure} hpa</p>}
				{this.props.wind && <p><b>Wind Speed </b>{this.props.wind.speed}km/h</p>}
				{this.props.wind && <p><b>Direction </b>{this.props.wind.deg}°</p>}
				{this.props.cloudiness && <p><b>Cloudiness </b> {this.props.cloudiness}</p>}
			</div>
		)
	}
}

//WeatherInfoComponent.propTypes = {
	//weather : PropTypes.object,
//}

export default WeatherInfoComponent;