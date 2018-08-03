import React from 'react';
import Navbar from './Navbar.jsx'
import RenderedPosts from './RenderedPosts.jsx'
import TypeSelector from './TypeSelector.jsx'
import EditProfileModal from './EditProfileModal.jsx'
import memoize from 'memoize-one'
import flower_background from 'images/flowers-background.jpg'

// style={{backgroundImage: `url(${flower_background})`}}

export default class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      streamData: [],
      profileInfo: {},
      type_selector_value: 0,
      isFollowing: false,
      editProfile: false
    };

    this.toggle_type = this.toggle_type.bind(this);
    this.changeProfile = this.changeProfile.bind(this);
    this.handleFollow = this.handleFollow.bind(this);
    this.handleUnfollow = this.handleUnfollow.bind(this);
    this.getStream = this.getStream.bind(this)
    this.getOriginalStream = this.getOriginalStream.bind(this)
    this.getPlaylistStream = this.getPlaylistStream.bind(this)
    this.getRepostStream = this.getRepostStream.bind(this)
    this.editProfile = this.editProfile.bind(this)
    this.closeEditProfile = this.closeEditProfile.bind(this)
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
        this.setState({
          isFollowing: data.userDetails.isFollowing,
          streamData: streamData,
          profileInfo: data.userDetails,
          type_selector_value: 0,
          editProfile: false
        })
    })
  })

  toggle_type(e) {
    if (e.target.name == 1) {
      this.getOriginalStream()
    } else if (e.target.name == 2) {
      this.getPostStream()
    } else if (e.target.name == 3) {
      this.getPlaylistStream()
    } else if (e.target.name == 4) {
      this.getRepostStream()
    } else {
      this.getStream()
    }
    this.setState({type_selector_value: e.target.name});
  }

  handleFollow(e) {
    fetch('/api/' + this.props.match.params.profile + '/follow', {
      method: 'POST',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
      if (data.message == 'success') {
        var tempProfileInfo = this.state.profileInfo
        tempProfileInfo.followers += 1
        this.setState({isFollowing: true, profileInfo: tempProfileInfo})
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
        var tempProfileInfo = this.state.profileInfo
        tempProfileInfo.followers -= 1
        this.setState({isFollowing: false, profileInfo: tempProfileInfo})
      }
    })
  }
  getStream() {
    fetch('/api/' + this.props.match.params.profile + '/stream', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      var streamData = data.stream
      console.log("streamData is", streamData);
      this.setState({streamData: streamData});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getOriginalStream() {
    fetch('/api/' + this.props.match.params.profile + '/streamOriginal', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      var streamData = data.stream
      console.log("streamData is", streamData);
      this.setState({streamData: streamData});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getPostStream() {
    fetch('/api/' + this.props.match.params.profile + '/streamPosts', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      var streamData = data.stream
      console.log("streamData is", streamData);
      this.setState({streamData: streamData});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getPlaylistStream() {
    fetch('/api/' + this.props.match.params.profile + '/streamPlaylists', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      var streamData = data.stream
      console.log("streamData is", streamData);
      this.setState({streamData: streamData});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getRepostStream() {
    fetch('/api/' + this.props.match.params.profile + '/streamReposts', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      var streamData = data.stream
      console.log("streamData is", streamData);
      this.setState({streamData: streamData});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  editProfile(e) {
    this.setState({editProfile: true})
  }

  closeEditProfile(e) {
    this.setState({editProfile: false})
  }

  render() {

    this.changeProfile(this.props.match.params.profile);

    return (
      <div>
        <EditProfileModal showModal={this.state.editProfile} profileInfo={this.state.profileInfo} closeEditProfile={this.closeEditProfile}/>
        <Navbar display={this.state.showNavbar}/>
        <div id="white_background_wrapper">
          <div id="profile_banner">
            <div id="profile_info">
              <img id="profile_info_image" alt="" src={this.state.profileInfo.profile_image_src}></img>
              <div id="profile_info_text_div">
                <p id="profile_info_username">{this.state.profileInfo.profileName}</p>
                <p id="profile_info_location">{this.state.profileInfo.location}</p>
                {!this.state.profileInfo.editable &&
                  <button id={this.state.isFollowing ? "following_button" : "follow_button"}
                    onClick={this.state.isFollowing ? this.handleUnfollow : this.handleFollow}>
                    {this.state.isFollowing ? 'Following' : 'Follow'}
                  </button>
                }
              </div>
            </div>
            <div id="profile_links">
              <p id="profile_description_text">Links ▼</p>
              <div className="profile_links_dropdown">
                {this.state.profileInfo.description}
              </div>
            </div>

          </div>
          <div id="content_wrapper">
            <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["All", "Original", "Posts", "Playlists", "Reposts"]}
            type_selector_value={this.state.type_selector_value} profileInfo={this.state.profileInfo} editProfile={this.editProfile}/>
            <RenderedPosts streamData={this.state.streamData} />
          </div>
        </div>
      </div>
    );
  }
}
