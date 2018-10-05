import React from 'react';
import { Modal } from 'react-bootstrap'
import trash_icon from 'images/trash-icon.png'

const url = process.env.REACT_APP_API_URL

export default class DeleteModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };

    this.showModal = this.showModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.handleDelete = this.handleDelete.bind(this);
  }

  showModal(e) {
    this.setState({showModal: true})
  }

  closeModal(e) {
    this.setState({showModal: false})
  }

  handleDelete(e) {
    fetch(url + '/api/deletePost', {
      method: 'DELETE',
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
        this.closeModal()
        window.location.reload()
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }


  render() {
    return (
      <div>
        <li onClick={this.showModal}>
          <div style={{backgroundImage: 'url(' + trash_icon + ')'}} />
          <p>Delete</p>
        </li>
        <Modal show={this.state.showModal} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <div className="delete_modal_body">
              <p>Are you sure you want to delete this post?</p>
              <p>You will lose all stats for this post</p>
              <div>
                <button className="cancel" onClick={this.closeModal}>Cancel</button>
                <button className="continue" onClick={this.handleDelete}>Delete</button>
              </div>
            </div>
          </Modal.Header>
        </Modal>
      </div>

    );
  }
}
