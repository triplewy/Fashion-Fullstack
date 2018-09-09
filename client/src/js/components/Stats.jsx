import React from 'react';
import TypeSelector from './TypeSelector.jsx'
import ViewsGraph from './ViewsGraph.jsx';
import TopStats from './TopStats.jsx'
import TimePeriod from './TimePeriod.jsx'

export default class Stats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      type_selector_value: 0,
      timePeriod: 1,
    };

    this.toggle_type = this.toggle_type.bind(this);
    this.toggleTime = this.toggleTime.bind(this);
  }

  toggle_type(e) {
    if (e.target.name == 0) {
      this.setState({type_selector_value: 0});
    } else {
      this.setState({type_selector_value: 1});
    }
  }

  toggleTime(e) {
    this.setState({timePeriod: e.target.value});
  }

  render() {
    return (
      <div id="white_background_wrapper">
        <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["Posts", "Playlists"]}
              type_selector_value={this.state.type_selector_value} right={<TimePeriod toggleTime={this.toggleTime} />} />
        <ViewsGraph postOrPlaylist={this.state.type_selector_value} timePeriod={this.state.timePeriod}/>
        <TopStats postOrPlaylist={this.state.type_selector_value} timePeriod={this.state.timePeriod}/>
      </div>
    );
  }
}
