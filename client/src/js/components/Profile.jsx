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
      type_selector_value: 0
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
        console.log("profile data is", data);
        var posts = []
        var reposts = []
        for (var i = 0; i < data.media.posts.length; i++) {
          if (data.media.posts[i].source == 'posts') {
            posts.push(data.media.posts[i])
          } else {
            reposts.push(data.media.posts[i])
          }
        }
        this.setState({posts: posts, reposts: reposts, jsonData: data.media, profileInfo: data.userDetails})
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
        <Navbar />
        <div id="white_background_wrapper">
        <div id="profile_banner" style={{backgroundImage: "url(../../images/flowers-background.jpg)"}}>
            <p id="featured_title">Featured:</p>
          </div>
        <div id="content_wrapper">
          <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["All", "Original", "Non-Original", "Collections", "Reposts"]}
          type_selector_value={this.state.type_selector_value}/>
          <RenderedPosts streamData={this.state.posts} />
        </div>
          <StatsColumn show_profile={true} profileInfo={this.state.profileInfo}/>
        </div>
      </div>
    );
  }
}
