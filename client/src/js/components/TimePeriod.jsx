import React from 'react';
import { Dropdown } from 'react-bootstrap'

export default class Stats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      timePeriodArray: ["Last 24 Hours", "Last Week", "Last Month", "Last Year", "All Time"],
      timePeriod: 1
    };

    this.toggleTime = this.toggleTime.bind(this);
  }

  toggleTime(e) {
    this.setState({timePeriod: e.target.value});
    this.props.toggleTime(e)
  }

  render() {
    return (
      <Dropdown id="time period dropdown" className="time_period_dropdown" pullRight={true}>
        <Dropdown.Toggle id="time_period_button" noCaret={true}>
          <p>{this.state.timePeriodArray[this.state.timePeriod]}</p>
        </Dropdown.Toggle>
        <Dropdown.Menu id="time_period_list">
          <li value='0' onClick={this.toggleTime}>Last 24 Hours</li>
          <li value='1' onClick={this.toggleTime}>Last Week</li>
          <li value='2' onClick={this.toggleTime}>Last Month</li>
          <li value='3' onClick={this.toggleTime}>Last Year</li>
          <li value='4' onClick={this.toggleTime}>All Time</li>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
