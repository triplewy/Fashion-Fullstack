import React from 'react';
import followers_icon from 'images/followers-icon.png'
import posts_icon from 'images/posts-icon.png'

const url = process.env.REACT_APP_API_URL

export default class PlaylistModalItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showAlert: false,
      success: false
    };

    this.addToPlaylist = this.addToPlaylist.bind(this);
    this.showAlert = this.showAlert.bind(this)
  }

  addToPlaylist() {
    this.setState({loading: true})
    var playlist = this.props.playlist
    fetch(url + '/api/addToPlaylist', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: playlist.playlistId,
        mediaId: this.props.mediaId,
        playlistIndex: playlist.biggestPlaylistIndex + 1
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        console.log("Added to playlist successfully");
        this.showAlert(true)
      } else {
        this.showAlert(false)
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  showAlert(status) {
    this.setState({showAlert: true, success: status, loading: false})
    setTimeout(function() {
      this.setState({showAlert: false, success: status, loading: false})
    }.bind(this), 2500)

    if (status) {
      this.props.getPlaylists()
    }
  }



  render() {
    const playlist = this.props.playlist
    return (
      <li className="playlist_selector" onClick={this.addToPlaylist} disabled={this.state.loading}>
        <div className="success" style={{width: this.state.showAlert ? '100%' : '0', backgroundColor: this.state.success ? '#9BDEBF' : '#C24750'}}>
          <p>{this.state.success? "Added successfully!" : "Post already exists in this collection"}</p>
        </div>
        <p id="playlist_title">{playlist.title}</p>
        <div className="playlist_icon_div">
          <p>{playlist.followers}</p>
          <div className="playlist_icon" style={{backgroundImage: 'url(' + followers_icon + ')'}} />
        </div>
        <div className="playlist_icon_div">
          <p>{playlist.numPosts}</p>
          <div className="playlist_icon" style={{backgroundImage: 'url(' + posts_icon + ')'}} />
        </div>
        {/* <p className="is_public">{playlist.public ? "Public" : "Private"}</p> */}
      </li>
    )
  }
}
