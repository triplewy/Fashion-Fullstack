import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap'

export default class Stats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      timePeriodArray: ["Last 24 Hours", "Last Week", "Last Month", "Last Year", "All Time"],
      timePeriod: 1
    };

    this.toggleTime = this.toggleTime.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this)
  }

  toggleTime(index) {
    this.setState({timePeriod: index, open: !this.state.open});
    this.props.toggleTime(index)
  }

  toggleDropdown(e) {
    this.setState({open: !this.state.open})
  }

  render() {
    return (
      <Dropdown id="time period dropdown" className="time_period_dropdown" onToggle={this.toggleDropdown}
        open={this.state.open} pullRight={true}>
        <Dropdown.Toggle id="time_period_button" noCaret={true}>
          <p>{this.state.timePeriodArray[this.state.timePeriod]}</p>
        </Dropdown.Toggle>
        <Dropdown.Menu id="time_period_list">
          <MenuItem value='0' onClick={this.toggleTime.bind(this, 0)}>Last 24 Hours</MenuItem>
          <MenuItem value='1' onClick={this.toggleTime.bind(this, 1)}>Last Week</MenuItem>
          <MenuItem value='2' onClick={this.toggleTime.bind(this, 2)}>Last Month</MenuItem>
          <MenuItem value='3' onClick={this.toggleTime.bind(this, 3)}>Last Year</MenuItem>
          <MenuItem value='4' onClick={this.toggleTime.bind(this, 4)}>All Time</MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
