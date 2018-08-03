import React from 'react';
import {Modal} from 'react-bootstrap'

export default class EditProfileModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profileName: this.props.profileInfo.profileName,
      location: this.props.profileInfo.location,
      description: this.props.profileInfo.description,
      username: this.props.profileInfo.username,
      profile_image_src: this.props.profileInfo.profile_image_src,
      changed_profile_image: false,
      showModal: this.props.showModal
    };

    this.handleChange = this.handleChange.bind(this);
    this.changeProfileImage = this.changeProfileImage.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.close = this.close.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      showModal: nextProps.showModal,
      profileName: nextProps.profileInfo.profileName,
      location: nextProps.profileInfo.location,
      description: nextProps.profileInfo.description,
      username: nextProps.profileInfo.username,
      profile_image_src: nextProps.profileInfo.profile_image_src
    });
  }

  handleChange(e) {
    var value = e.target.value;
    this.setState({[e.target.name]: value});
  }

  changeProfileImage(e) {
    this.setState({changed_profile_image: true})
  }

  handleSave(e) {
    var body = {}
    if (this.state.changed_profile_image) {
      body = {
        profileName: this.state.profileName,
        location: this.state.location,
        description: this.state.description,
        username: this.state.username,
        profile_image_src: this.state.profile_image_src
      }
    } else {
      body = {
        profileName: this.state.profileName,
        location: this.state.location,
        description: this.state.description,
        username: this.state.username
      }
    }

    console.log(body);
    fetch('/api/' + this.state.username + '/edit', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
      if (data.message == 'success') {
        this.close()
      }
    })
  }

  close(e){
    this.props.closeEditProfile()
    this.setState({ showModal: false });
  }

  render() {
    console.log(this.state.profileName);
    return (
      <Modal show={this.state.showModal} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body id="edit_profile_modal_body">
          <div id="edit_profile_image_div">
            <img id="edit_profile_image" alt="" src={this.state.profile_image_src}></img>
            <button id="edit_profile_image_button">Update</button>
          </div>
          <div id="edit_profile_text_div">
            <div className="form-group">
                <label className="login_label">Profile Name</label>
                <input type="text" className="form-control"
                name="profileName" onChange={this.handleChange}
                value={this.state.profileName}></input>
            </div>
            <div className="form-group">
                <label className="login_label">Location</label>
                <input type="text" className="form-control"
                name="location" onChange={this.handleChange}
                value={this.state.location}></input>
            </div>
            <div className="form-group">
                <label className="login_label">Description</label>
                <textarea className="form-control"
                name="description" onChange={this.handleChange}
                value={this.state.description}></textarea>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-default" onClick={this.handleSave}>Save</button>
        </Modal.Footer>
      </Modal>
    );
  }
}
