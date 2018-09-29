import React from 'react';
import PlaylistModalItem from './PlaylistModalItem.jsx'
import PlaylistModalCreate from './PlaylistModalCreate.jsx'
import { Modal } from 'react-bootstrap'
import plus_icon from 'images/plus-icon.png'

export default class PlaylistModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      playlists: [],
      showNewPlaylist: false
    };

    this.getPlaylists = this.getPlaylists.bind(this)
    this.createNewPlaylist = this.createNewPlaylist.bind(this);
    this.backButton = this.backButton.bind(this);
    this.showModal = this.showModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  getPlaylists() {
    fetch('/api/getPlaylists', {
      credentials: 'include'
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      this.setState({playlists: data, showNewPlaylist: false})
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

  showModal(e) {
    this.setState({showModal: true})
  }

  closeModal(e) {
    this.setState({showModal: false})
  }

  render() {
    var renderedPlaylists = []
    if (this.state.playlists.length > 0) {
      renderedPlaylists = this.state.playlists.map((item, index) => {
        return (
          <PlaylistModalItem key={index} playlist={item} mediaId={this.props.mediaId} getPlaylists={this.getPlaylists}/>
        )
      })
    }

    return (
      <div id="add_playlist_wrapper">
        <button id="add_to_playlist" onClick={this.showModal}>
          <div style={{backgroundImage: 'url(' + plus_icon + ')'}}/>
        </button>
        <Modal show={this.state.showModal} onHide={this.closeModal} onEnter={this.getPlaylists}>
          <Modal.Header closeButton>
            {this.state.showNewPlaylist && <button className="playlist_modal_back_button" onClick={this.backButton}>Back</button>}
            <Modal.Title>{this.state.showNewPlaylist ? "Create New Collection" : "Add To Collection"}</Modal.Title>
          </Modal.Header>
          <Modal.Body id="playlist_modal">
            {this.state.showNewPlaylist ?
              <PlaylistModalCreate mediaId={this.props.mediaId} />
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
      </div>
    );
  }
}
