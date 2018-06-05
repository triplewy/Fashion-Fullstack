import React from 'react';
import Navbar from './Navbar.jsx'
import TypeSelector from './TypeSelector.jsx'
import ViewsGraph from './ViewsGraph.jsx';

export default class Stats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      type_selector_value: 0,
      time_period: 1
    };
    this.toggle_type = this.toggle_type.bind(this);
    this.toggle_time = this.toggle_time.bind(this);

  }

  toggle_type(e) {
    this.setState({type_selector_value: e.target.name});
  }

  toggle_time(e) {
    this.setState({time_period: e.target.value});
  }

  render() {
    const time_period_array = ["Last 24 Hours", "Last Week", "Last Month", "Last Year", "All Time"];
    console.log(time_period_array);
    var time_period_display = time_period_array[this.state.time_period];
    var temp_time_period_array = time_period_array;
    temp_time_period_array.splice(this.state.time_period, 1);
    console.log(temp_time_period_array);
    var rendered_time_period_array = temp_time_period_array.map((item, index) => {
        return (
          <li key={index} value={index} onClick={this.toggle_time}>{item}</li>
        )
    });
      return (
        <div>
        <Navbar />
        <div id="white_background_wrapper">
            <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["Overall", "Posts"]}
                  type_selector_value={this.state.type_selector_value}/>
            <div id="time_period_dropdown" className="dropdown">
            <button id="time_period_button" className="dropdown-toggle" type="button" data-toggle="dropdown">
                  {time_period_display}<span className="caret"></span>
            </button>
            <ul id="time_period_list"className="dropdown-menu">
              {rendered_time_period_array}
            </ul>
            </div>
            <ViewsGraph />
          </div>
        </div>
  );
  }
}
