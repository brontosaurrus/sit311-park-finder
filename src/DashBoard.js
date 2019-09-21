import React from 'react';

class DashBoard extends React.Component {

	render() {
		return (
			<div>
				{this.props.bayid && <p>Bay ID: {this.props.bayid}</p>}
				{this.props.location && <p>Latitude: {parseFloat(this.props.location.Latitude).toFixed(2)} Longitude: {parseFloat(this.props.location.Longitude).toFixed(2)}</p>}
				{this.props.status && <p>Status: {this.props.status}</p>}
			</div>
		)
	}
}

export default DashBoard;