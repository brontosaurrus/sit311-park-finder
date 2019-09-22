import React from 'react';

var weekday = new Array(7);
weekday[0] =  "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

class DashBoard extends React.Component {
	
	setDays = (i) => {
		let s = 6;
		let	f = 0;
		i.map(j => {
			if(j<s){
				s=j;
			}
			if(j>f){
				f=j;
			}
		})
		if(s===f){
			return weekday[s];
		}else{
			return (weekday[s]+" - "+weekday[f]);
		}
			
	}
	


	render() {
		return (
			<div>
				{this.props.bayid && <p>Bay ID: {this.props.bayid}</p>}
				{this.props.status && <p>Status: {this.props.status}</p>}
				{this.props.restriction && this.props.restriction.map(i => {return (<p> Type: {i.IsFree} Days: {this.setDays(i.Days)} Time: {i.Time.start} - {i.Time.end} Duration: {i.Duration.normal}</p>)})}
			</div>
		)
	}
}

export default DashBoard;