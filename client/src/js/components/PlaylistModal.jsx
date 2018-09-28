import React from 'react';
import followers_icon from 'images/followers-icon.png'
import posts_icon from 'images/posts-icon.png'
import {Modal} from 'react-bootstrap'
import Cookie from 'js-cookie'

export default class PlaylistModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: this.props.showModal,
      titleInput: '',
      url: '',
      urlAvailable: false,
      genreInput: '',
      descriptionInput: '',
      selectedOption: 'private',
      playlists: [],
      showNewPlaylist: false,
    };

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getPlaylists = this.getPlaylists.bind(this)
    this.addToPlaylist = this.addToPlaylist.bind(this);
    this.createNewPlaylist = this.createNewPlaylist.bind(this);
    this.backButton = this.backButton.bind(this);
    this.checkUrlAvailability = this.checkUrlAvailability.bind(this)
    this.fetchUrlAvailable = this.fetchUrlAvailable.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (this.props.showModal !== prevProps.showModal) {
      this.setState({showModal: this.props.showModal});
    }
  }

  handleChange(e) {
    this.setState({[e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    var isPublic = false
    if (this.state.selectedOption === 'public') {
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
        url: this.state.url,
        genre: this.state.genreInput,
        description: this.state.descriptionInput,
        isPublic: isPublic,
        mediaId: this.props.mediaId
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        console.log("Added to playlist successfully");
        this.props.closeModal()
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

  addToPlaylist(playlistId, numPosts) {
    fetch('/api/addToPlaylist', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: playlistId,
        mediaId: this.props.mediaId,
        playlistIndex: numPosts
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

  checkUrlAvailability(e) {
    this.setState({url: e.target.value.replace(/\W+/g, '-').toLowerCase()})
    this.fetchUrlAvailable(e.target.value.replace(/\W+/g, '-').toLowerCase())
  }

  fetchUrlAvailable(url) {
    if (url) {
      fetch('/api/urlAvailable/collection/' + url, {
        credentials: 'include'
      })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        this.setState({urlAvailable: (data.length === 0)});
      })
      .catch((error) => {
        console.error(error);
      });
    }
  }



  render() {
    var renderedPlaylists = []
    if (this.state.playlists.length > 0) {
      renderedPlaylists = this.state.playlists.map((item, index) => {
        return (
          <li className="playlist_selector" key={index} value={this.props.mediaId} onClick={this.addToPlaylist.bind(this, item.playlistId, item.numPosts)}>
            <p id="playlist_title">{item.title}</p>
            <div className="playlist_icon_div">
              <p>{item.followers}</p>
              <div className="playlist_icon" style={{backgroundImage: 'url(' + followers_icon + ')'}} />
            </div>
            <div className="playlist_icon_div">
              <p>{item.numPosts}</p>
              <div className="playlist_icon" style={{backgroundImage: 'url(' + posts_icon + ')'}} />
            </div>
            <p className="is_public">{item.public ? "Public" : "Private"}</p>
          </li>
        )
      })
    }

    return (
      <Modal show={this.state.showModal} onHide={this.props.closeModal} onEnter={this.getPlaylists}>
        <Modal.Header closeButton>
          {this.state.showNewPlaylist && <button className="playlist_modal_back_button" onClick={this.backButton}>Back</button>}
          <Modal.Title>{this.state.showNewPlaylist ? "Create New Collection" : "Add To Collection"}</Modal.Title>
        </Modal.Header>
        <Modal.Body id="playlist_modal">
          {this.state.showNewPlaylist ?
            <div id="create_new_playlist_wrapper">
              <div id="input_div">
                <label className="required">Title:</label>
                <input type="text" autoComplete="off" name="titleInput" onChange={this.handleChange} onBlur={this.checkUrlAvailability} value={this.state.titleInput}></input>
                <div className="url_div">
                  <p className="url_head">{"fashion.com/" + Cookie.get('username') + "/collection/"}</p>
                  <input className="url" type="text" autoComplete="off" name="url" onChange={this.checkUrlAvailability}
                    placeholder={this.state.url} value={this.state.url} style={{boxShadow: (this.state.urlAvailable || !this.state.url ? "" : "0 1px 0px 0px red")}}></input>
                </div>
                <label className="required">Genre:</label>
                <input type="text" autoComplete="off" name="genreInput" onChange={this.handleChange} value={this.state.genreInput}></input>
                <label>Description:</label>
                <textarea type="text" autoComplete="off" rows="5" name="descriptionInput" onChange={this.handleChange} value={this.state.descriptionInput}></textarea>
                <div className="playlist_input_div">
                  <label className="playlist_input_label">Public</label>
                  <input className="playlist_input" type="radio" name="selectedOption" value="public"
                    checked={this.state.selectedOption === 'public'} onChange={this.handleChange}></input>
                  <label className="playlist_input_label">Private</label>
                  <input className="playlist_input" type="radio" name="selectedOption"
                    value="private" checked={this.state.selectedOption === 'private'}
                    onChange={this.handleChange}></input>
                </div>
                <button type="button" onClick={this.handleSubmit} disabled={!this.state.titleInput || !this.state.genreInput || !this.state.urlAvailable}>Create</button>
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
