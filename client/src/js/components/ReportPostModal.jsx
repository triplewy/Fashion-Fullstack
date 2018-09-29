import React from 'react';
import { Modal } from 'react-bootstrap'
import report_icon from 'images/report-icon.png'

export default class ReportPostModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };

    this.showModal = this.showModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  showModal(e) {
    this.setState({showModal: true})
  }

  closeModal(e) {
    this.setState({showModal: false})
  }


  render() {
    return (
      <div>
        <li onClick={this.showModal}>
          <div style={{backgroundImage: 'url(' + report_icon + ')'}} />
          <p>Report</p>
        </li>
        <Modal show={this.state.showModal} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              Report Post
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="edit_post_modal_body">
              <p>This currently does nothing</p>
            </div>
          </Modal.Body>
        </Modal>
      </div>

    );
  }
}
