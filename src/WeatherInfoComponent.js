import React from 'react';
import PropTypes from 'prop-types';

class WeatherInfoComponent extends React.Component {

	render() {
		return (
			//<React.Fragment>
				//<p>{JSON.stringify(this.props.weather)}</p>
			//</React.Fragment>
			<div>
				{this.props.city && <p>Location: {this.props.city}</p>}
				{this.props.temperature && <p>Temperature: {this.props.temperature}</p>}
				{this.props.humidity && <p>Humidity: {this.props.humidity}</p>}
				{this.props.pressure && <p>Pressure: {this.props.pressure}</p>}
				{this.props.wind && <p>Wind: speed is {this.props.wind.speed}km/h and direction is {this.props.wind.deg} degrees</p>}
				{this.props.cloudiness && <p>Cloudiness: {this.props.cloudiness}</p>}
			</div>
		)
	}
}

//WeatherInfoComponent.propTypes = {
	//weather : PropTypes.object,
//}

export default WeatherInfoComponent;