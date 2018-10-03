import React from 'react';
import TypeSelector from './TypeSelector.jsx'
import LikesPosts from './LikesPosts.jsx'
import LikesCollections from './LikesCollections.jsx'

export default class Likes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      type_selector_value: 0
    };

    this.toggle_type = this.toggle_type.bind(this);
  }

  toggle_type(e) {
    var parsed = parseInt(e.target.name, 10);
    if (isNaN(parsed)) {
      parsed = 0
    }
    this.setState({type_selector_value: parsed})
  }

  render() {
    return (
      <div id="white_background_wrapper">
        <p className="page_title">Likes</p>
        <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["Posts", "Collections"]}
        type_selector_value={this.state.type_selector_value}/>
        {this.state.type_selector_value ?
          <LikesCollections />
          :
          <LikesPosts />
        }
    </div>
  );
  }
}
