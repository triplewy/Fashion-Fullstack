import React from 'react';
import view_icon from 'images/view-icon.png'
import like_icon from 'images/heart-icon.png'
import repost_icon from 'images/repost-icon.png'
import comment_icon from 'images/comment-icon.png'
import plus_icon from 'images/plus-icon.svg'

// <button id="comments" className={stats_button_style} onClick={this.handleComment}>
//   <img id="comment_icon" alt="comment icon" className={stats_icon_style} src={comment_icon}></img>
//   <p className="stats_number" id="comment_number">{this.state.comments}</p>
// </button>

export default class StatsHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      views: this.props.views,
      likes: this.props.likes,
      reposts: this.props.reposts,
      liked: false,
      reposted: false,
      displayPlaylist: false
    };

    this.handleLike = this.handleLike.bind(this);
    this.handleUnlike = this.handleUnlike.bind(this);
    this.handleRepost = this.handleRepost.bind(this);
    this.handleUnrepost = this.handleUnrepost.bind(this);
    this.addNewPlaylist = this.addNewPlaylist.bind(this);
  }

  handleLike(e) {
    fetch('/api/like', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.mediaId,
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
    fetch('/api/unlike', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.mediaId,
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
    fetch('/api/repost', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.mediaId,
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
    fetch('/api/unrepost', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.mediaId,
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

  addNewPlaylist(e) {
    this.setState({displayPlaylist: true})
  }

  render() {
    var stats_icon_style = "stats_icon";
    var stats_button_style="stats_button";
    if (this.props.is_collection) {
      stats_icon_style = "collection_stats_icon";
      stats_button_style="collection_stats_button";
    }

    return (
      <div id="stats_header">
        <button id="views" className={stats_button_style}>
          <img id="views_icon" alt="view icon" className={stats_icon_style} src={view_icon}></img>
          <p className="stats_number" id="view_number">{this.state.views}</p>
        </button>
        <button id="likes" className={stats_button_style} onClick={this.state.liked ? this.handleUnlike : this.handleLike}>
          <img id="like_icon" alt="like icon" className={stats_icon_style} src={like_icon}></img>
          <p className="stats_number" id="like_number">{this.state.likes}</p>
        </button>
        <button id="reposts" className={stats_button_style} onClick={this.state.reposted ? this.handleUnrepost : this.handleRepost}>
          <img id="repost_icon" alt="repost icon" className={stats_icon_style} src={repost_icon}></img>
          <p className="stats_number" id="repost_number">{this.state.reposts}</p>
        </button>
      {this.props.is_collection ? null :
        <div id="playlist_dropdown">
          <button id="add_to_playlist" className="stats_button" onClick={this.addNewPlaylist}>
            <img id="add_to_playlist_icon" alt="add icon" className="stats_icon" src={plus_icon}></img>
          </button>
        </div>
    }
    </div>
    );
  }
}
