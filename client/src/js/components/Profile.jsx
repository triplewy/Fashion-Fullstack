import React from 'react';
import RenderedPosts from './RenderedPosts.jsx'
import TypeSelector from './TypeSelector.jsx'
import EditProfileModal from './EditProfileModal.jsx'
import memoize from 'memoize-one'
import flower_background from 'images/flowers-background.jpg'
import * as loadImage from 'blueimp-load-image'

// style={{backgroundImage: `url(${flower_background})`}}

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      streamData: [],
      profileInfo: {},
      type_selector_value: 0,
      isFollowing: false,
      editProfile: false,
      profile_image_file: null,
      profile_image_src: ''
    };

    this.toggle_type = this.toggle_type.bind(this);
    this.changeProfile = this.changeProfile.bind(this);
    this.handleFollow = this.handleFollow.bind(this);
    this.handleUnfollow = this.handleUnfollow.bind(this);
    this.getProfile = this.getProfile.bind(this)
    this.getUserDetails = this.getUserDetails.bind(this)
    this.getStream = this.getStream.bind(this)
    this.getOriginalStream = this.getOriginalStream.bind(this)
    this.getPlaylistStream = this.getPlaylistStream.bind(this)
    this.getRepostStream = this.getRepostStream.bind(this)
    this.editProfile = this.editProfile.bind(this)
    this.closeEditProfile = this.closeEditProfile.bind(this)
    this.readImageFile = this.readImageFile.bind(this)
  }

  changeProfile = memoize((url) => {
    console.log("we memoized");
    this.getProfile(url)
  })

  componentWillReceiveProps(nextProps) {
    this.getProfile(nextProps.profile);
  }

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
    fetch('/api/' + this.props.profile + '/follow', {
      method: 'POST',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
      if (data.message == 'success') {
        var tempProfileInfo = this.state.profileInfo
        tempProfileInfo.followers += 1
        this.setState({isFollowing: true, profileInfo: tempProfileInfo})
      } else if (data.message == 'not logged in') {
        console.log("not logged in");
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleUnfollow(e) {
    fetch('/api/' + this.props.profile + '/unfollow', {
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
    .catch((error) => {
      console.error(error);
    });
  }

  getProfile(url) {
    fetch('/api/' + url, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log("profile data is", data);
      this.setState({
        isFollowing: data.userDetails.isFollowing,
        streamData: data.media.stream,
        profileInfo: data.userDetails,
        type_selector_value: 0,
        editProfile: false,
        profile_image_src: data.userDetails.profile_image_src
      })
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getUserDetails() {
    fetch('/api/' + this.props.profile + '/userDetails', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      this.setState({profileInfo: data.userDetails});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getStream() {
    fetch('/api/' + this.props.profile + '/stream', {
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
    fetch('/api/' + this.props.profile + '/streamOriginal', {
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
    fetch('/api/' + this.props.profile + '/streamPosts', {
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
    fetch('/api/' + this.props.profile + '/streamPlaylists', {
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
    fetch('/api/' + this.props.profile + '/streamReposts', {
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

  readImageFile(e) {
    e.preventDefault();
    var file = e.target.files[0];

    const loadImageOptions = { canvas: true }
    loadImage.parseMetaData(file, (data) => {
      if (data.exif) {
        loadImageOptions.orientation = data.exif.get('Orientation')
        console.log("loadImageOptions are", loadImageOptions);
      }
      loadImage(file, (canvas) => {
        console.log("file is", file);
        file.preview = canvas.toDataURL(file.type)

        var formData = new FormData();
        formData.append('image', file);

        fetch('/api/' + this.props.profile + '/updateProfileImage', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })
        .then(response => {
          console.log(response);
          if (response.status == 400) {
            console.log("not logged in");
          } else {
            return response.json()
          }
        })
        .then(data => {
          console.log(data.message);
          if (data.message == 'success') {
            console.log("updated profile pic successfully");
            this.setState({
              profile_image_file: file,
              profile_image_src: file.preview,
            })
          }
        })
      }, loadImageOptions)
    })
  }

  render() {

    this.changeProfile(this.props.profile);

    return (
      <div>
        <EditProfileModal showModal={this.state.editProfile} profileInfo={this.state.profileInfo}
          profile_image_src={this.state.profile_image_src} closeEditProfile={this.closeEditProfile}
          readImageFile={this.readImageFile} getUserDetails={this.getUserDetails}/>
        <div id="white_background_wrapper">
          <div id="profile_banner">
            <div id="profile_info">
              <div id="profile_info_image_div">
                <img id="profile_info_image" alt="" src={this.state.profile_image_src}></img>
                {this.state.profileInfo.editable &&
                  <div>
                    <label htmlFor="input_image_button" id="update_profile_image_label">
                      Update
                    </label>
                    <input id="input_image_button" type="file" name="post_pic" accept="image/*"
                      onChange={this.readImageFile}></input>
                  </div>
                }
              </div>
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
