import React from 'react';
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
    this.displayPlaylists = this.displayPlaylists.bind(this);
    this.addToPlaylist = this.addToPlaylist.bind(this);
    this.createNewPlaylist = this.createNewPlaylist.bind(this);
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

  displayPlaylists(e) {
    console.log("yoo");
    fetch('/api/getPlaylists', {
      credentials: 'include'
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.playlists);
      this.setState({playlists: data.playlists})
    })
    .catch((error) => {
      console.error(error);
    });
  }

  addToPlaylist(playlistId) {
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

  createNewPlaylist(e) {

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
            <p>{item.title}</p>
            <p>Followers: {item.followers}</p>
            {item.public ? <p>Public</p> : <p>Private</p>}
            <p>Posts: {item.numPosts}</p>
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
          {this.props.is_collection ? null :
            <div id="add_playlist_wrapper">
              <button id="add_to_playlist" type="button" className={stats_button_style} data-toggle="modal" data-target="#playlistModal" onClick={this.displayPlaylists}>
                <img id="add_to_playlist_icon" alt="add icon" className="stats_icon" src={plus_icon}></img>
              </button>
              <div className="modal fade" id="playlistModal" role="dialog">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal">&times;</button>
                      <h4 className="modal-title">Add to Playlist</h4>
                    </div>
                    <div className="modal-body">
                      <div id="create_new_playlist" className="playlist_selector" onClick={this.createNewPlaylist}>New Playlist +</div>
                      <ul>
                        {renderedPlaylists}
                      </ul>
                    </div>
                  </div>
              </div>
              </div>
            </div>
          }
          <button id="more" className={stats_button_style}>
            <img id="more_icon" alt="more icon" className="non_stat_icon" src={more_icon}></img>
          </button>
      </div>
    </div>
    );
  }
}
