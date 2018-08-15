import React from 'react';
import followers_icon from 'images/followers-icon.png'
import posts_icon from 'images/posts-icon.png'
import {Modal} from 'react-bootstrap'

export default class PlaylistModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: this.props.showModal,
      titleInput: '',
      genreInput: '',
      descriptionInput: '',
      selectedOption: 'private',
      playlists: [],
      showNewPlaylist: false,
      mediaId: this.props.mediaId
    };

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getPlaylists = this.getPlaylists.bind(this)
    this.addToPlaylist = this.addToPlaylist.bind(this);
    this.createNewPlaylist = this.createNewPlaylist.bind(this);
    this.backButton = this.backButton.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      showModal: nextProps.showModal,
      mediaId: nextProps.mediaId
    });
  }

  handleChange(e) {
    this.setState({[e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    var isPublic = false
    if (this.state.selectedOption == 'public') {
      isPublic = true
    }

    fetch('/api/newPlaylist', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        title: this.state.titleInput,
        genre: this.state.genreInput,
        description: this.state.descriptionInput,
        isPublic: isPublic,
        mediaId: this.state.mediaId
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

  getPlaylists() {
    fetch('/api/getPlaylists', {
      credentials: 'include'
    })
    .then((response) => response.json())
    .then((data) => {
      this.setState({playlists: data.playlists, showNewPlaylist: false})
    })
    .catch((error) => {
      console.error(error);
    });
  }

  addToPlaylist(playlistId, mediaId) {
    console.log(mediaId);
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
    this.setState({showNewPlaylist: true})
  }

  backButton(e) {
    this.setState({showNewPlaylist: false})
  }


  render() {
    var renderedPlaylists = []
    if (this.state.playlists.length > 0) {
      renderedPlaylists = this.state.playlists.map((item, index) => {
        return (
          <li className="playlist_selector" key={index} value={this.props.mediaId} onClick={this.addToPlaylist.bind(this, item.playlistId)}>
            <p id="playlist_title">{item.title}</p>
            <p className="playlist_icon_div">{item.public ? "Public" : "Private"}</p>
            <div className="playlist_icon_div">
              <img className="playlist_icon" src={followers_icon}></img>
              {item.followers}
            </div>
            <div className="playlist_icon_div">
              <img className="playlist_icon" src={posts_icon}></img>
              {item.numPosts}
            </div>
          </li>
        )
      })
    }

    return (
      <Modal show={this.state.showModal} onHide={this.props.closeModal} onEnter={this.getPlaylists}>
        <Modal.Header closeButton>
          <Modal.Title>{this.state.showNewPlaylist ? "Create New Playlist" : "Add To Playlist"}</Modal.Title>
        </Modal.Header>
        <Modal.Body id="playlist_modal">
          {this.state.showNewPlaylist ?
            <div id="create_new_playlist_wrapper">
              <div id="login_input_fields">
                <input type="text" autocomplete="off" placeholder="Title"
                  name="titleInput" onChange={this.handleChange} value={this.state.titleInput}></input>
                <input type="text" autocomplete="off" placeholder="Genre"
                  name="genreInput" onChange={this.handleChange} value={this.state.genreInput}></input>
                <textarea type="text" autocomplete="off" placeholder="Description"
                  name="descriptionInput" onChange={this.handleChange} value={this.state.descriptionInput}></textarea>
                <div className="playlist_input_div">
                  <label className="playlist_input_label">Public</label>
                  <input type="radio" name="selectedOption" id="public_radio_input" value="public"
                    checked={this.state.selectedOption === 'public'} onChange={this.handleChange}></input>
                  <label className="playlist_input_label">Private</label>
                  <input className="playlist_input" type="radio" name="selectedOption"
                    id="private_radio_input" value="private" checked={this.state.selectedOption === 'private'}
                    onChange={this.handleChange}></input>
                </div>
                <button type="button" onClick={this.handleSubmit} disabled={!this.state.titleInput}>Create</button>
              </div>
            </div>
            :
            <div>
              <div id="create_new_playlist" className="playlist_selector" onClick={this.createNewPlaylist}>New Playlist +</div>
              <ul id="playlists_list">
                {renderedPlaylists}
              </ul>
            </div>
          }
        </Modal.Body>
      </Modal>
    );
  }
}
