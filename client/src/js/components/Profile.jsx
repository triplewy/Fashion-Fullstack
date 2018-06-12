import React from 'react';
import StatsColumn from './StatsColumn.jsx'
import Navbar from './Navbar.jsx'
import RenderedPosts from './RenderedPosts.jsx'
import TypeSelector from './TypeSelector.jsx'

export default class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      post_data: [],
      json_data: [],
      profileInfo: {},
      type_selector_value: 0
    };

    this.toggle_type = this.toggle_type.bind(this);
  }

  componentDidMount() {
    fetch('/api/' + this.props.match.params.profile + '/info', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log("profile info is", data);
      this.setState({profileInfo: data.userDetails});
    });

    fetch('/api/' + this.props.match.params.profile, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log("profile data is", data);
      this.setState({post_data: data.posts, json_data: data.posts, profileInfo: data.userDetails});
    });
  }

  toggle_type(e) {
    var data = this.state.json_data;
    var temp_data = [];
    if (e.target.name == 1) {
      for (var i = 0; i < data.length; i++) {
        if(data[i].original) {
          temp_data.push(data[i]);
        }
      }
    } else if (e.target.name == 2) {
      for (i = 0; i < data.length; i++) {
        if(!data[i].original) {
          temp_data.push(data[i]);
        }
      }
    } else {
      temp_data = data;
    }
    this.setState({post_data: temp_data, type_selector_value: e.target.name});
  }


  render() {
      return (
        <div>
        <Navbar />
        <div id="white_background_wrapper">
        <div id="profile_banner" style={{backgroundImage: "url(../../images/flowers-background.jpg)"}}>
            <p id="featured_title">Featured:</p>
          </div>
        <div id="content_wrapper">
          <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["All", "Original", "Non-Original", "Collections", "Reposts"]}
          type_selector_value={this.state.type_selector_value}/>
          <RenderedPosts post_data={this.state.post_data} />
        </div>
          <StatsColumn show_profile={true} profileInfo={this.state.profileInfo}/>
        </div>
      </div>
    );
  }
}
