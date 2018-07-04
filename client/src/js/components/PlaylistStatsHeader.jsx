import React from 'react';
import like_icon from 'images/heart-icon.png'
import repost_icon from 'images/repost-icon.png'


export default class StatsHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      likes: this.props.likes,
      reposts: this.props.reposts,
      followers: this.props.followers,
      liked: false,
      reposted: false,
      followed: false,
    };

    this.handleLike = this.handleLike.bind(this);
    this.handleUnlike = this.handleUnlike.bind(this);
    this.handleRepost = this.handleRepost.bind(this);
    this.handleUnrepost = this.handleUnrepost.bind(this);
    this.handleFollow = this.handleFollow.bind(this);
    this.handleUnfollow = this.handleUnfollow.bind(this);
  }

  handleLike(e) {
    console.log("playlistId is", this.props.playlistId);
    fetch('/api/playlistLike', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: this.props.playlistId,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({likes: this.state.likes + 1, liked: true})
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleUnlike(e) {
    fetch('/api/playlistUnlike', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: this.props.playlistId,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({likes: this.state.likes - 1, liked: false})
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleRepost(e) {
    fetch('/api/playlistRepost', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: this.props.playlistId,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({reposts: this.state.reposts + 1, reposted: true})
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleUnrepost(e) {
    fetch('/api/playlistUnrepost', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: this.props.playlistId,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({reposts: this.state.reposts - 1, reposted: false})
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleFollow(e) {

  }

  handleUnfollow(e) {

  }

  render() {
    return (
      <div id="stats_header">
        <button id="likes" className="stats_button" onClick={this.state.liked ? this.handleUnlike : this.handleLike}>
          <img id="like_icon" alt="like icon" className="stats_icon" src={like_icon}></img>
          <p className="stats_number" id="like_number">{this.state.likes}</p>
        </button>
        <button id="reposts" className="stats_button" onClick={this.state.reposted ? this.handleUnrepost : this.handleRepost}>
          <img id="repost_icon" alt="repost icon" className="stats_icon" src={repost_icon}></img>
          <p className="stats_number" id="repost_number">{this.state.reposts}</p>
        </button>
        <button id="followers" className="stats_button" onClick={this.state.followed ? this.handleUnfollow : this.handleFollow}>
          <img id="follower_icon" alt="follower icon" className="stats_icon" src={repost_icon}></img>
          <p className="stats_number" id="follower_number">{this.state.followers}</p>
        </button>
    </div>
    );
  }
}
