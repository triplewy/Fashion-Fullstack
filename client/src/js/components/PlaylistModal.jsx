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

    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleGenreChange = this.handleGenreChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getPlaylists = this.getPlaylists.bind(this)
    this.addToPlaylist = this.addToPlaylist.bind(this);
    this.createNewPlaylist = this.createNewPlaylist.bind(this);
    this.backButton = this.backButton.bind(this);
    this.close = this.close.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      showModal: nextProps.showModal,
      mediaId: nextProps.mediaId
    });
  }

  handleTitleChange(e) {
    this.setState({titleInput: e.target.value})
  }

  handleGenreChange(e) {
    this.setState({genreInput: e.target.value})
  }

  handleDescriptionChange(e) {
    this.setState({descriptionInput: e.target.value})
  }

  handleOptionChange(e) {
    this.setState({selectedOption: e.target.value});
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

  close(e){
    console.log("close");
    // e.stopPropagation()
    this.setState({ showModal: false });
  }


  render() {
    var renderedPlaylists = []
    if (this.state.playlists.length > 0) {
      renderedPlaylists = this.state.playlists.map((item, index) => {
        return (
          <li className="playlist_selector" key={index} value={this.props.mediaId} onClick={this.addToPlaylist.bind(this, item.playlistId)}>
            <p id="playlist_title">{item.title}</p>
            <div className="playlist_icon_div">
              <img className="playlist_icon" src={followers_icon}></img>
              {item.followers}
            </div>
            <div className="playlist_icon_div">
              <img className="playlist_icon" src={posts_icon}></img>
              {item.numPosts}
            </div>
            {item.public ? <p id="public_indicator">Public</p> : <p id="public_indicator">Private</p>}
          </li>
        )
      })
    }

    return (
      <Modal show={this.state.showModal} onHide={this.close} onEnter={this.getPlaylists}>
        {this.state.showNewPlaylist ?
        <div>
        <Modal.Header closeButton>
          <Modal.Title>Create New Playlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="create_new_playlist_wrapper">
            <div className="playlist_input_div">
              <label className="playlist_input_label">Title</label>
              <input className="playlist_input" type="text" placeholder="title" value={this.state.titleInput}
                onChange={this.handleTitleChange}></input>
            </div>
            <div className="playlist_input_div">
              <label className="playlist_input_label">Genre</label>
              <input className="playlist_input" type="text" placeholder="genre" value={this.state.genreInput}
                onChange={this.handleGenreChange}></input>
            </div>
            <div className="playlist_input_div">
              <label className="playlist_input_label">Description</label>
              <textarea className="playlist_input" type="text" placeholder="description" value={this.state.descriptionInput}
                onChange={this.handleDescriptionChange}></textarea>
            </div>
            <div className="playlist_input_div">
              <label className="playlist_input_label">Public</label>
              <input type="radio" name="privacy" id="public_radio_input" value="public"
                checked={this.state.selectedOption === 'public'} onChange={this.handleOptionChange}></input>
              <label className="playlist_input_label">Private</label>
              <input className="playlist_input" type="radio" name="privacy"
                id="private_radio_input" value="private" checked={this.state.selectedOption === 'private'}
                onChange={this.handleOptionChange}></input>
            </div>
            <button type="button" id="create_playlist_button" onClick={this.handleSubmit} disabled={!this.state.titleInput}>Create</button>
          </div>
        </Modal.Body>
        </div>
        :
        <div>
        <Modal.Header closeButton>
          <Modal.Title>Add to Playlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="create_new_playlist" className="playlist_selector" onClick={this.createNewPlaylist}>New Playlist +</div>
          <ul id="playlists_list">
            {renderedPlaylists}
          </ul>
        </Modal.Body>
        </div>
      }
      </Modal>
    );
  }
}
