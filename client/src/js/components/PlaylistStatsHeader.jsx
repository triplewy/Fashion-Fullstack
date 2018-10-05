import React from 'react';
import PlaylistMoreDropdown from './PlaylistMoreDropdown.jsx'
import NotLoggedInOverlay from './NotLoggedInOverlay.jsx'
import like_icon from 'images/heart-icon.png'
import like_icon_liked from 'images/heart-icon-liked.png'
import repost_icon from 'images/repost-icon.png'
import repost_icon_reposted from 'images/repost-icon-reposted.png'
import followers_icon_notFollowed from 'images/followers-icon-notFollowed.png'
import followers_icon_followed from 'images/followers-icon-followed.png'

const url = process.env.REACT_APP_API_URL

export default class StatsHeader extends React.Component {
  constructor(props) {
    super(props);

    const playlist = this.props.playlist
    this.state = {
      likes: playlist.likes,
      reposts: playlist.reposts,
      followers: playlist.followers,
      liked: playlist.liked,
      reposted: playlist.reposted,
      followed: playlist.followed,

      showOverlay: false,
      target: null
    };

    this.handleLike = this.handleLike.bind(this);
    this.handleUnlike = this.handleUnlike.bind(this);
    this.handleRepost = this.handleRepost.bind(this);
    this.handleUnrepost = this.handleUnrepost.bind(this);
    this.handleFollow = this.handleFollow.bind(this);
    this.handleUnfollow = this.handleUnfollow.bind(this);
    this.showOverlay = this.showOverlay.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (this.props.playlist !== prevProps.playlist) {
      const playlist = this.props.playlist
      this.setState({likes: playlist.likes, reposts: playlist.reposts, followers: playlist.followers,
        liked: playlist.liked, reposted: playlist.reposted, followed: playlist.followed})
    }
  }

  handleLike(e) {
    e.stopPropagation()
    const target = e.target
    fetch(url + '/api/playlistLike', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: this.props.playlist.playlistId,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({likes: this.state.likes + 1, liked: true})
      } else if (data.message === "not logged in") {
        this.showOverlay(target)
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleUnlike(e) {
    e.stopPropagation()
    const target = e.target
    fetch(url + '/api/playlistUnlike', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: this.props.playlist.playlistId,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({likes: this.state.likes - 1, liked: false})
      } else if (data.message === "not logged in") {
        this.showOverlay(target)
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleRepost(e) {
    e.stopPropagation()
    const target = e.target
    fetch(url + '/api/playlistRepost', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: this.props.playlist.playlistId,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({reposts: this.state.reposts + 1, reposted: true})
      } else if (data.message === "not logged in") {
        this.showOverlay(target)
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleUnrepost(e) {
    e.stopPropagation()
    const target = e.target
    fetch(url + '/api/playlistUnrepost', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: this.props.playlist.playlistId,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({reposts: this.state.reposts - 1, reposted: false})
      } else if (data.message === "not logged in") {
        this.showOverlay(target)
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleFollow(e) {
    e.stopPropagation()
    const target = e.target
    fetch(url + '/api/playlistFollow', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: this.props.playlist.playlistId,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({followers: this.state.followers + 1, followed: true})
      } else if (data.message === "not logged in") {
        this.showOverlay(target)
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleUnfollow(e) {
    e.stopPropagation()
    const target = e.target
    fetch(url + '/api/playlistUnfollow', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: this.props.playlist.playlistId,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({followers: this.state.followers - 1, followed: false})
      } else if (data.message === "not logged in") {
        this.showOverlay(target)
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  showOverlay(target) {
    this.setState({showOverlay: true, target: target})
    setTimeout(function() {
      this.setState({showOverlay: false})
    }.bind(this), 2000)
  }

  render() {
    const isPoster = this.props.playlist.isPoster
    return (
      <div id="stats_header">
        <button onClick={this.state.followed ? this.handleUnfollow : this.handleFollow} disabled={isPoster}>
          <div style={{backgroundImage: this.state.followed ? 'url(' + followers_icon_followed + ')' : 'url(' + followers_icon_notFollowed + ')'}}/>
          <p className="stats_number">{this.state.followers}</p>
        </button>
        <button onClick={this.state.liked ? this.handleUnlike : this.handleLike}>
          <div style={{backgroundImage: this.state.liked ? 'url(' + like_icon_liked + ')' : 'url(' + like_icon + ')'}}/>
          <p className="stats_number">{this.state.likes}</p>
        </button>
        <button onClick={this.state.reposted ? this.handleUnrepost : this.handleRepost} disabled={isPoster}>
          <div style={{backgroundImage: this.state.reposted ? 'url(' + repost_icon_reposted + ')' : 'url(' + repost_icon + ')'}}/>
          <p className="stats_number">{this.state.reposts}</p>
        </button>
        <NotLoggedInOverlay showOverlay={this.state.showOverlay} target={this.state.target} />
        <div id="non_stat_div">
          <PlaylistMoreDropdown playlist={this.props.playlist} />
        </div>
      </div>
    )
  }
}
