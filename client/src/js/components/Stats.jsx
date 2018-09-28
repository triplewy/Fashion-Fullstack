import React from 'react';
import TypeSelector from './TypeSelector.jsx'
import TotalPostsStats from './TotalPostsStats.jsx'
import TotalCollectionsStats from './TotalCollectionsStats.jsx'
import ViewsGraphPosts from './ViewsGraphPosts.jsx';
import ViewsGraphCollections from './ViewsGraphCollections.jsx';
import TopPostsStats from './TopPostsStats.jsx'
import TopCollectionsStats from './TopCollectionsStats.jsx'
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

  componentDidMount() {
    window.scrollTo(0,0)
  }

  toggle_type(e) {
    if (e.target.name == 0) {
      this.setState({type_selector_value: 0});
    } else {
      this.setState({type_selector_value: 1});
    }
  }

  toggleTime(index) {
    this.setState({timePeriod: index});
  }

  render() {
    if (this.state.type_selector_value) {
      return (
        <div id="white_background_wrapper">
          <p className="page_title">Stats</p>
          <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["Posts", "Collections"]}
                type_selector_value={this.state.type_selector_value} right={<TimePeriod toggleTime={this.toggleTime} />} />
          <TotalCollectionsStats timePeriod={this.state.timePeriod}/>
          <ViewsGraphCollections timePeriod={this.state.timePeriod}/>
          <TopCollectionsStats timePeriod={this.state.timePeriod}/>
          <div style={{margin: '100px 0'}}>
            Filler div to prevent overflow
          </div>
        </div>
      )
    } else {
      return (
        <div id="white_background_wrapper">
          <p className="page_title">Stats</p>
          <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["Posts", "Collections"]}
                type_selector_value={this.state.type_selector_value} right={<TimePeriod toggleTime={this.toggleTime} />} />
          <TotalPostsStats timePeriod={this.state.timePeriod}/>
          <ViewsGraphPosts timePeriod={this.state.timePeriod}/>
          <TopPostsStats timePeriod={this.state.timePeriod}/>
          <div style={{margin: '100px 0'}}>
            Filler div to prevent overflow
          </div>
        </div>
      )
    }
  }
}
