import React from 'react';
import RenderedPosts from './RenderedPosts.jsx'
import TypeSelector from './TypeSelector.jsx'
import EditProfileModal from './EditProfileModal.jsx'
import ProfileInfo from './ProfileInfo.jsx'
import Cookie from 'js-cookie'
// import * as loadImage from 'blueimp-load-image'

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      streamData: null,
      profileInfo: {},
      isProfile: false,
      type_selector_value: 0,
    };

    this.toggle_type = this.toggle_type.bind(this);
    this.fetchStream = this.fetchStream.bind(this)
    this.handleFollow = this.handleFollow.bind(this);
    this.handleUnfollow = this.handleUnfollow.bind(this);
    // this.getProfile = this.getProfile.bind(this)
    // this.fetchProfileStream = this.fetchProfileStream.bind(this)
    this.fetchProfileInfo = this.fetchProfileInfo.bind(this)
    this.profileVisit = this.profileVisit.bind(this)
    // this.getUserDetails = this.getUserDetails.bind(this)
    this.getStream = this.getStream.bind(this)
    this.getOriginalStream = this.getOriginalStream.bind(this)
    this.getPlaylistStream = this.getPlaylistStream.bind(this)
    this.getRepostStream = this.getRepostStream.bind(this)
    this.readImageFile = this.readImageFile.bind(this)
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    this.fetchProfileInfo(this.props.profile)
    this.getStream()
    this.profileVisit()
  }

  componentDidUpdate(prevProps) {
    if (this.props.profile !== prevProps.profile) {
      window.scrollTo(0, 0)
      this.setState({type_selector_value: 0})
      this.fetchProfileInfo(this.props.profile)
      this.getStream()
      this.profileVisit()
    }
  }

  toggle_type(e) {
    this.fetchStream(e.target.name * 1)
    // if (e.target.name == 1) {
    //   this.getOriginalStream()
    // } else if (e.target.name == 2) {
    //   this.getPostStream()
    // } else if (e.target.name == 3) {
    //   this.getPlaylistStream()
    // } else if (e.target.name == 4) {
    //   this.getRepostStream()
    // } else {
    //   this.getStream()
    // }
    this.setState({type_selector_value: e.target.name});
  }

  fetchStream(type_selector_value) {
    switch (type_selector_value) {
      case 0:
        this.getStream()
        break;
      case 1:
        this.getOriginalStream()
        break;
      case 2:
        this.getPostStream()
        break;
      case 3:
        this.getPlaylistStream()
        break;
      case 4:
        this.getRepostStream()
        break;
      default:
        this.getStream()
    }
  }

  profileVisit() {
    if (Cookie.get('username') !== this.props.profile) {
      fetch('/api/profileVisit', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: this.props.profile,
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
    } else {
      console.log("same user");
    }
  }

  handleFollow(e) {
    fetch('/api/' + this.props.profile + '/follow', {
      method: 'POST',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'success') {
        var tempProfileInfo = this.state.profileInfo
        tempProfileInfo.followers += 1
        tempProfileInfo.isFollowing = true
        this.setState({profileInfo: tempProfileInfo})
      } else if (data.message === 'not logged in') {
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
      if (data.message === 'success') {
        var tempProfileInfo = this.state.profileInfo
        tempProfileInfo.followers -= 1
        tempProfileInfo.isFollowing = false
        this.setState({profileInfo: tempProfileInfo})
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  // getProfile(url) {
  //   fetch('/api/' + url, {
  //     credentials: 'include'
  //   })
  //   .then(res => res.json())
  //   .then(data => {
  //     console.log("profile data is", data);
  //     this.setState({
  //       isFollowing: data.userDetails.isFollowing,
  //       streamData: data.media.stream,
  //       profileInfo: data.userDetails,
  //       type_selector_value: 0,
  //       editProfile: false,
  //       profile_image_src: data.userDetails.profile_image_src
  //     })
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });
  // }

  // fetchProfileStream(profile) {
  //   fetch('/api/' + profile + '/stream', {
  //     credentials: 'include'
  //   })
  //   .then(res => res.json())
  //   .then(data => {
  //     console.log(data);
  //     this.setState({
  //       streamData: data.stream
  //     })
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });
  // }

  fetchProfileInfo() {
    fetch('/api/' + this.props.profile + '/info', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({profileInfo: data.profile, isProfile: data.isUser})
    })
    .catch((error) => {
      console.error(error);
    });
  }

  // getUserDetails() {
  //   fetch('/api/' + this.props.profile + '/userDetails', {
  //     credentials: 'include'
  //   })
  //   .then(res => res.json())
  //   .then(data => {
  //     this.setState({profileInfo: data.userDetails});
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });
  // }

  getStream() {
    fetch('/api/' + this.props.profile + '/stream', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({streamData: data.stream});
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
      console.log(data);
      this.setState({streamData: data.stream});
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
      console.log(data);
      this.setState({streamData: data.stream});
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
      console.log(data);
      this.setState({streamData: data.stream});
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
      console.log(data);
      this.setState({streamData: data.stream});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  readImageFile(e) {
    e.preventDefault();
    const file = e.target.files[0];
    // var reader = new FileReader();
    // reader.onloadend = () => {
    //   // var img = new Image();
    //   //   img.onload = () => {
    //   //     var [width, height] = setAspectRatio(img.width, img.height)
    //   //     var tempDimensions = this.state.dimensions
    //   //     tempDimensions[index] = {original: {width: img.width, height: img.height}, display: {width: width, height: height}}
    //   //     this.setState({dimensions: tempDimensions})
    //   //   };
    //   // img.src = reader.result;
    // }
    // console.log("file is", file);
    // reader.readAsDataURL(file);
    //
    // const loadImageOptions = { canvas: true }
    // loadImage.parseMetaData(file, (data) => {
    //   if (data.exif) {
    //     loadImageOptions.orientation = data.exif.get('Orientation')
    //     console.log("loadImageOptions are", loadImageOptions);
    //   }
    //   loadImage(file, (canvas) => {
    //     console.log("file is", file);
    //     file.preview = canvas.toDataURL(file.type)
    //
    console.log("file is", file);
    var formData = new FormData();
    formData.append('image', file);

    fetch('/api/updateProfileImage', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    .then(response => {
      console.log(response);
      if (response.status === 400) {
        console.log("not logged in");
      } else {
        return response.json()
      }
    })
    .then(data => {
      if (data.profile_image_src) {
        console.log("updated profile pic successfully");
        const profile = this.state.profileInfo
        this.fetchProfileInfo()
        this.fetchStream(this.state.type_selector_value)
        this.props.setUser({username: profile.username, profileName: profile.profileName, profile_image_src: data.profile_image_src})
      } else {
        console.log(data.message);
      }
    })
    //   }, loadImageOptions)
    // })
  }

  render() {
    return (
      <div>
        <div id="white_background_wrapper">
          <div id="profile_banner">
            <div className="profile_info">
              <div id="profile_info_image_div">
                <div className="edit_profile_image" style={{backgroundImage: 'url(' + this.state.profileInfo.profile_image_src + ')'}}>
                {this.state.isProfile &&
                  <div>
                    <label htmlFor="input_image_button">Update</label>
                    <input id="input_image_button" type="file" name="post_pic" accept="image/*"
                      onChange={this.readImageFile}></input>
                  </div>
                }
                </div>
              </div>
              <div className="profile_info_text_div">
                <div>
                  <p id="profile_info_username">{this.state.profileInfo.profileName}</p>
                  <p id="profile_info_location">{this.state.profileInfo.location}</p>
                  {!this.state.isProfile &&
                    <button id={this.state.profileInfo.isFollowing ? "following_button" : "follow_button"}
                      onClick={this.state.profileInfo.isFollowing ? this.handleUnfollow : this.handleFollow}>
                      {this.state.profileInfo.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
          <div id="content_wrapper">
            <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["All", "Original", "Posts", "Playlists", "Reposts"]}
            type_selector_value={this.state.type_selector_value}
            right={<ProfileInfo profileInfo={this.state.profileInfo} isProfile={this.state.isProfile} fetchProfileInfo={this.fetchProfileInfo}
              readImageFile={this.readImageFile} getStream={this.getStream} setUser={this.props.setUser}/> } />
            {this.state.streamData &&
              <RenderedPosts streamData={this.state.streamData} />
            }
          </div>
        </div>
      </div>
    );
  }
}
