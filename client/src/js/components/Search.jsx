import React from 'react';
import Navbar from './Navbar.jsx'
import InputTag from './InputTag.jsx'
import Charts from './Charts.jsx'
// import posts from '../json/posts.json';


export default class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      type_selector_value: 0,
    };
    this.toggle_type = this.toggle_type.bind(this);
  }

  toggle_type(e) {
    if (e.target.id === "type_top") {
      this.setState({type_selector_value: 0});
    } else if (e.target.id === "type_hot") {
      this.setState({type_selector_value: 1});
    } else if (e.target.id === "type_random") {
      this.setState({type_selector_value: 2});
    }
  }

  render() {
      return (
        <div>
        <Navbar />
        <div id="white_background_wrapper">
        <div id="outfit_finder_type_selector">
          <button className={(this.state.type_selector_value === 0)?
              "type_selector_button_selected" : 'type_selector_button'}
              disabled={(this.state.type_selector_value === 0)}
              id="type_top" onClick={this.toggle_type}>Top</button>
          <button className={(this.state.type_selector_value === 1)?
                  "type_selector_button_selected" : 'type_selector_button'}
                  disabled={(this.state.type_selector_value === 1)}
                  id="type_hot" onClick={this.toggle_type}>Hot</button>
          <button className={(this.state.type_selector_value === 2)?
              "type_selector_button_selected" : 'type_selector_button'}
              disabled={(this.state.type_selector_value === 2)}
              id="type_random" onClick={this.toggle_type}>Random</button>
        <div id="genre_selector_div">
          <p id="genre_selector_title">Genre:</p>
          <input name="genre_selector" id="genre_selector_input"
            placeholder="All"></input>
        </div>
      </div>
        <Charts />
        <div id="add_tags_div">
          <div id="time_selector_div">
            <select id="time_selector" name="time_period"
              value={this.state.time_period} onChange={this.handleChange}>
              <option value="time_hours">Last 24 Hours</option>
              <option value="time_week">Last Week</option>
              <option value="time_month">Last Month</option>
              <option value="time_year">Last Year</option>
              <option value="time_all_time">All Time</option>
            </select>
          </div>
          <InputTag />
        </div>

        </div>
      </div>
  );
  }
}
