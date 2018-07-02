import React from 'react';
import StatsColumn from './StatsColumn.jsx'
import Navbar from './Navbar.jsx'
import RenderedPosts from './RenderedPosts.jsx'
import TypeSelector from './TypeSelector.jsx'
import memoize from 'memoize-one'

export default class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      jsonData: [],
      streamData: [],
      posts: [],
      reposts: [],
      profileInfo: {},
      type_selector_value: 0,
    };

    this.toggle_type = this.toggle_type.bind(this);
    this.changeProfile = this.changeProfile.bind(this);
  }

  changeProfile = memoize((url) => {
      console.log("we memoized yeeee", url);
      fetch('/api/' + url, {
        credentials: 'include'
      })
      .then(res => res.json())
      .then(data => {
        var streamData = data.media.stream
        console.log("profile data is", data);
        var posts = []
        var reposts = []
        this.setState({posts: posts, reposts: reposts, streamData: streamData, jsonData: data.media, profileInfo: data.userDetails})
    })
  })

  toggle_type(e) {
    var data = this.state.jsonData;
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
    this.setState({posts: temp_data, type_selector_value: e.target.name});
  }


  render() {

    this.changeProfile(this.props.match.params.profile);

    return (
      <div>
        <Navbar display={this.state.showNavbar}/>
        <div id="white_background_wrapper">
          <div id="profile_banner">
            <div id="profile_info">
              <img id="profile_info_image" alt="" src={this.state.profileInfo.profile_image_src}></img>
              <div id="profile_info_text_div">
                <p className="profile_info_text" id="profile_info_username">{this.state.profileInfo.profileName}</p>
                <p className="profile_info_text" id="profile_info_location">{this.state.profileInfo.location}</p>
              </div>
            </div>
            <div id="profile_description">
              <p className="profile_info_text" id="profile_info_followers">Followers: {this.state.profileInfo.followers}</p>
              <p className="profile_info_text" id="profile_info_following">Following: {this.state.profileInfo.following}</p>
              <p id="profile_description_text">{this.state.profileInfo.description}</p>
            </div>
          </div>
          <div id="content_wrapper">
            <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["All", "Original", "Non-Original", "Collections", "Reposts"]}
            type_selector_value={this.state.type_selector_value}/>
            <RenderedPosts streamData={this.state.streamData} />
          </div>
        </div>
      </div>
    );
  }
}
