import React from 'react';
import TypeSelector from './TypeSelector.jsx'
import ViewsGraph from './ViewsGraph.jsx';
import TopStats from './TopStats.jsx'
import {Dropdown} from 'react-bootstrap'

export default class Stats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      timePeriodArray: ["Last 24 Hours", "Last Week", "Last Month", "Last Year", "All Time"],
      type_selector_value: 0,
      time_period: 1,
    };

    this.toggle_type = this.toggle_type.bind(this);
    this.toggle_time = this.toggle_time.bind(this);
  }

  toggle_type(e) {
    if (e.target.name == 0) {
      this.setState({type_selector_value: 0});
    } else {
      this.setState({type_selector_value: 1});
    }
  }

  toggle_time(e) {
    this.setState({time_period: e.target.value});
  }

  render() {
    return (
      <div id="white_background_wrapper">
        <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["Posts", "Playlists"]}
              type_selector_value={this.state.type_selector_value}/>
        <Dropdown className="time_period_dropdown">
          <Dropdown.Toggle id="time_period_button" noCaret={true}>
            <p>{this.state.timePeriodArray[this.state.time_period]}</p>
          </Dropdown.Toggle>
          <Dropdown.Menu id="time_period_list" >
            <li value={0} onClick={this.toggle_time}>Last 24 Hours</li>
            <li value={1} onClick={this.toggle_time}>Last Week</li>
            <li value={2} onClick={this.toggle_time}>Last Month</li>
            <li value={3} onClick={this.toggle_time}>Last Year</li>
            <li value={4} onClick={this.toggle_time}>All Time</li>
          </Dropdown.Menu>
        </Dropdown>
        <ViewsGraph postOrPlaylist={this.state.type_selector_value}/>
        <TopStats postOrPlaylist={this.state.type_selector_value}/>
      </div>
    );
  }
}
