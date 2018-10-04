import React from 'react';
import RenderedPosts from './RenderedPosts.jsx'
import TypeSelector from './TypeSelector.jsx'
import EditProfileModal from './EditProfileModal.jsx'
import ProfileInfo from './ProfileInfo.jsx'
import NotLoggedInOverlay from './NotLoggedInOverlay.jsx'
import ErrorPage from './ErrorPage.jsx'
import InfiniteScroll from 'react-infinite-scroller'
import Cookie from 'js-cookie'
import { Jumbotron } from 'react-bootstrap'
// import * as loadImage from 'blueimp-load-image'

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      streamData: [],
      profileInfo: {},
      isProfile: false,
      type_selector_value: 0,
      error: false,

      showOverlay: false,
      target: null,

      hasMore: true
    };

    this.toggle_type = this.toggle_type.bind(this);
    this.fetchStream = this.fetchStream.bind(this)
    this.fetchStreamScroll = this.fetchStreamScroll.bind(this)
    this.handleFollow = this.handleFollow.bind(this);
    this.handleUnfollow = this.handleUnfollow.bind(this);
    this.fetchProfileInfo = this.fetchProfileInfo.bind(this)
    this.profileVisit = this.profileVisit.bind(this)
    this.getStream = this.getStream.bind(this)
    this.getOriginalStream = this.getOriginalStream.bind(this)
    this.getPlaylistStream = this.getPlaylistStream.bind(this)
    this.getRepostStream = this.getRepostStream.bind(this)
    this.readImageFile = this.readImageFile.bind(this)
    this.showOverlay = this.showOverlay.bind(this)
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    this.fetchProfileInfo(this.props.profile)
    this.fetchStream(0)
    this.profileVisit()
  }

  componentDidUpdate(prevProps) {
    if (this.props.profile !== prevProps.profile) {
      window.scrollTo(0, 0)
      this.setState({type_selector_value: 0, streamData: []})
      this.fetchProfileInfo(this.props.profile)
      this.fetchStream(0)
      this.profileVisit()
    }
  }

  toggle_type(e) {
    this.setState({type_selector_value: e.target.name, streamData: []});
    this.fetchStream(e.target.name * 1)
  }

  fetchStream(type_selector_value) {
    const seconds = Math.round(Date.now() / 1000)
    switch (type_selector_value) {
      case 0:
        this.getStream(seconds)
        break;
      case 1:
        this.getOriginalStream(seconds)
        break;
      case 2:
        this.getPostStream(seconds)
        break;
      case 3:
        this.getPlaylistStream(seconds)
        break;
      case 4:
        this.getRepostStream(seconds)
        break;
      default:
        this.getStream(seconds)
    }
  }

  fetchStreamScroll() {
    const d = new Date(this.state.streamData[this.state.streamData.length - 1].repostDate);
    const seconds = Math.round(d.getTime() / 1000);

    switch (this.state.type_selector_value) {
      case 0:
        this.getStream(seconds)
        break;
      case 1:
        this.getOriginalStream(seconds)
        break;
      case 2:
        this.getPostStream(seconds)
        break;
      case 3:
        this.getPlaylistStream(seconds)
        break;
      case 4:
        this.getRepostStream(seconds)
        break;
      default:
        this.getStream(seconds)
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
    const target = e.target
    fetch('/api/follow', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: this.props.profile
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'success') {
        var tempProfileInfo = this.state.profileInfo
        tempProfileInfo.followers += 1
        tempProfileInfo.isFollowing = true
        this.setState({profileInfo: tempProfileInfo})
      } else if (data.message === 'not logged in') {
        this.showOverlay(target)
      } else {
        console.log(data);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleUnfollow(e) {
    const target = e.target
    fetch('/api/unfollow', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: this.props.profile
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'success') {
        var tempProfileInfo = this.state.profileInfo
        tempProfileInfo.followers -= 1
        tempProfileInfo.isFollowing = false
        this.setState({profileInfo: tempProfileInfo})
      } else if (data.message === "not logged in") {
        this.showOverlay(target)
      } else {
        console.log(data);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  fetchProfileInfo() {
    fetch('/api/' + this.props.profile + '/info', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.message === "error") {
        this.setState({error: true})
      } else {
        this.setState({profileInfo: data.profile, isProfile: data.isUser})
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getStream(lastDateSeconds) {
    fetch('/api/' + this.props.profile + '/stream/' + lastDateSeconds, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.message === "error") {
        this.setState({error: true})
      } else {
        var streamData = this.state.streamData
        for (var i = 0; i < data.stream.length; i++) {
          streamData.push(data.stream[i])
        }
        var hasMore = true
        if (data.stream.length < 20) {
          hasMore = false
        }
        this.setState({streamData: streamData, hasMore: hasMore});
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getOriginalStream(lastDateSeconds) {
    fetch('/api/' + this.props.profile + '/streamOriginal/' + lastDateSeconds, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.message === "error") {
        this.setState({error: true})
      } else {
        var streamData = this.state.streamData
        for (var i = 0; i < data.stream.length; i++) {
          streamData.push(data.stream[i])
        }
        var hasMore = true
        if (data.stream.length < 20) {
          hasMore = false
        }
        this.setState({streamData: streamData, hasMore: hasMore});
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getPostStream(lastDateSeconds) {
    fetch('/api/' + this.props.profile + '/streamPosts/' + lastDateSeconds, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.message === "error") {
        this.setState({error: true})
      } else {
        var streamData = this.state.streamData
        for (var i = 0; i < data.stream.length; i++) {
          streamData.push(data.stream[i])
        }
        var hasMore = true
        if (data.stream.length < 20) {
          hasMore = false
        }
        this.setState({streamData: streamData, hasMore: hasMore});
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getPlaylistStream(lastDateSeconds) {
    fetch('/api/' + this.props.profile + '/streamPlaylists/' + lastDateSeconds, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.message === "error") {
        this.setState({error: true})
      } else {
        var streamData = this.state.streamData
        for (var i = 0; i < data.stream.length; i++) {
          streamData.push(data.stream[i])
        }
        var hasMore = true
        if (data.stream.length < 20) {
          hasMore = false
        }
        this.setState({streamData: streamData, hasMore: hasMore});
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getRepostStream(lastDateSeconds) {
    fetch('/api/' + this.props.profile + '/streamReposts/' + lastDateSeconds, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.message === "error") {
        this.setState({error: true})
      } else {
        var streamData = this.state.streamData
        for (var i = 0; i < data.stream.length; i++) {
          streamData.push(data.stream[i])
        }
        var hasMore = true
        if (data.stream.length < 20) {
          hasMore = false
        }
        this.setState({streamData: streamData, hasMore: hasMore});
      }
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

  showOverlay(target) {
    this.setState({showOverlay: true, target: target})
    setTimeout(function() {
      this.setState({showOverlay: false})
    }.bind(this), 2000)
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorPage />
      )
    } else {
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
                  <NotLoggedInOverlay showOverlay={this.state.showOverlay} target={this.state.target} />
                </div>
              </div>
              <div className="profile_info_description_div">
                <div>
                  <div className="profile_info_description_title">About</div>
                  {this.state.profileInfo.description &&
                  <div>
                    <p id="description">{this.state.profileInfo.description.split('\n').map((item, key) => {
                      return <span key={key}>{item}<br/></span>})}
                    </p>
                  </div>
                  }
                </div>
              </div>
            </div>
            <div id="content_wrapper">
              <TypeSelector
                toggle_type={this.toggle_type.bind(this)}
                types={["All", "Original", "Posts", "Collections", "Reposts"]}
                type_selector_value={this.state.type_selector_value}
              right={
                <ProfileInfo
                  profileInfo={this.state.profileInfo}
                  isProfile={this.state.isProfile}
                  fetchProfileInfo={this.fetchProfileInfo}
                  readImageFile={this.readImageFile}
                  getStream={this.getStream}
                  setUser={this.props.setUser}/> }
                />
              {this.state.streamData.length > 0 ?
                <RenderedPosts
                  streamData={this.state.streamData}
                  hasMore={this.state.hasMore}
                  fetchStreamScroll={this.fetchStreamScroll}
                />
                :
                <Jumbotron>
                  <p>There doesn't seem to be anything here!</p>
                </Jumbotron>
              }
            </div>
          </div>
        </div>
      )
    }
  }
}
