import React from 'react';
import StatsColumn from './StatsColumn.jsx'
import Navbar from './Navbar.jsx'
import RenderedPosts from './RenderedPosts.jsx'
import TypeSelector from './TypeSelector.jsx'
import memoize from 'memoize-one'
import flower_background from 'images/flowers-background.jpg'

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
      isFollowing: false
    };

    this.toggle_type = this.toggle_type.bind(this);
    this.changeProfile = this.changeProfile.bind(this);
    this.handleFollow = this.handleFollow.bind(this);
    this.handleUnfollow = this.handleUnfollow.bind(this);
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
        this.setState({isFollowing: data.userDetails.isFollowing, streamData: streamData, jsonData: data.media, profileInfo: data.userDetails})
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

  handleFollow(e) {
    fetch('/api/' + this.props.match.params.profile + '/follow', {
      method: 'POST',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
      if (data.message == 'success') {
        this.setState({isFollowing: true})
      }
    })
  }

  handleUnfollow(e) {
    fetch('/api/' + this.props.match.params.profile + '/unfollow', {
      method: 'POST',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
      if (data.message == 'success') {
        this.setState({isFollowing: false})
      }
    })
  }

  render() {

    this.changeProfile(this.props.match.params.profile);

    return (
      <div>
        <Navbar display={this.state.showNavbar}/>
        <div id="white_background_wrapper">
          <div id="profile_banner" style={{backgroundImage: `url(${flower_background})`}}>
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
            <button id="follow_button" onClick={this.state.isFollowing ? this.handleUnfollow : this.handleFollow}>
              {this.state.isFollowing ? 'Following' : 'Follow'}
            </button>
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
