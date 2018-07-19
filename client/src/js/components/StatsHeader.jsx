import React from 'react';
import PlaylistModalView from './PlaylistModalView.jsx'
import view_icon_revised from 'images/view-icon-revised.png'
import like_icon from 'images/heart-icon.png'
import like_icon_liked from 'images/heart-icon-liked.png'
import repost_icon from 'images/repost-icon.png'
import repost_icon_reposted from 'images/repost-icon-reposted.png'
import plus_icon from 'images/plus-icon.png'
import more_icon from 'images/more-icon.png'

export default class StatsHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      views: this.props.views,
      likes: this.props.likes,
      reposts: this.props.reposts,
      liked: this.props.liked,
      reposted: this.props.reposted,
      playlists: []
    };

    this.handleLike = this.handleLike.bind(this);
    this.handleUnlike = this.handleUnlike.bind(this);
    this.handleRepost = this.handleRepost.bind(this);
    this.handleUnrepost = this.handleUnrepost.bind(this);
    this.addToPlaylist = this.addToPlaylist.bind(this);
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
    console.log("props Id is", this.props.mediaId);
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

  addToPlaylist(playlistId) {
    console.log(this.props.media);
    fetch('/api/addToPlaylist', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: playlistId,
        mediaId: this.props.mediaId
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        console.log("Added to playlist successfully");
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    var stats_icon_style = "stats_icon";
    var stats_button_style="stats_button";
    if (this.props.is_collection) {
      stats_icon_style = "collection_stats_icon";
      stats_button_style="collection_stats_button";
    }

    var renderedPlaylists = []
    if (this.state.playlists.length > 0) {
      renderedPlaylists = this.state.playlists.map((item, index) => {
        return (
          <li className="playlist_selector" key={index} onClick={this.addToPlaylist.bind(this, item.playlistId)}>
            <p id="playlist_title">{item.title}</p>
            <p className="playlist_icon">Followers: {item.followers}</p>
            <p className="playlist_icon">Posts: {item.numPosts}</p>
            {item.public ? <p id="public_indicator">Public</p> : <p id="public_indicator">Private</p>}
          </li>
        )
      })
    }

    return (
      <div id="stats_header">
        <button id="views" className={stats_button_style}>
          <img id="views_icon" alt="view icon" className={stats_icon_style} src={view_icon_revised}></img>
          <p className="stats_number" id="view_number">{this.state.views}</p>
        </button>
        <button id="likes" className={stats_button_style} onClick={this.state.liked ? this.handleUnlike : this.handleLike}>
          <img id="like_icon" alt="like icon" className={stats_icon_style} src={this.state.liked ? like_icon_liked : like_icon}></img>
          <p className="stats_number" id="like_number">{this.state.likes}</p>
        </button>
        <button id="reposts" className={stats_button_style} onClick={this.state.reposted ? this.handleUnrepost : this.handleRepost}>
          <img id="repost_icon" alt="repost icon" className={stats_icon_style} src={this.state.reposted ? repost_icon_reposted : repost_icon}></img>
          <p className="stats_number" id="repost_number">{this.state.reposts}</p>
        </button>
        <div id="non_stat_div">
          <div id="add_playlist_wrapper">
            <button id="add_to_playlist" type="button" className={stats_button_style} data-toggle="modal" data-target={"#playlistModal" + this.props.mediaId}>
              <img id="add_to_playlist_icon" alt="add icon" className="stats_icon" src={plus_icon}></img>
            </button>
            <PlaylistModalView mediaId={this.props.mediaId} />
          </div>
          <div className="btn-group">
            <button id="more" className="dropdown-toggle" type="button" data-toggle="dropdown">
              <img id="more_icon" alt="more icon" className="non_stat_icon" src={more_icon}></img>
            </button>
            <ul className="dropdown-menu">
              <li className="form-group">
                Yo
              </li>
            </ul>
          </div>
      </div>
    </div>
    );
  }
}
