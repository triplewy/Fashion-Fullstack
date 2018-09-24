import React from 'react';
import validator from 'validator';
import {Modal} from 'react-bootstrap'

export default class EditProfileModal extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.profileInfo) {
      this.state = {
        usernameInput: this.props.profileInfo.username,
        usernameIsValid: true,
        profileNameInput: this.props.profileInfo.profileName,
        locationInput: this.props.profileInfo.location,
        descriptionInput: this.props.profileInfo.description,
        showModal: false
      }
    } else {
      this.state = {
        usernameInput: '',
        usernameIsValid: false,
        profileNameInput: '',
        locationInput: '',
        descriptionInput: '',
        showModal: false
      }
    }

    this.handleChange = this.handleChange.bind(this);
    this.checkUsername = this.checkUsername.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (this.props.profileInfo !== prevProps.profileInfo) {
      this.setState({
        usernameInput: this.props.profileInfo.username,
        profileNameInput: this.props.profileInfo.profileName,
        locationInput: this.props.profileInfo.location,
        descriptionInput: this.props.profileInfo.description,
      });
    }
  }

  handleChange(e) {
    var value = e.target.value;
    this.setState({[e.target.name]: value});
  }

  checkUsername(e) {
    this.setState({usernameInput: e.target.value})
    if (!validator.isAlphanumeric(e.target.value) && !e.target.value) {
      console.log("not valid username");
      this.setState({usernameIsValid: false})
    } else if (e.target.value === this.props.profileInfo.username) {
      console.log("hello");
      this.setState({usernameIsValid: true})
    } else {
      fetch('/api/checkUsername', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: e.target.value
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.message === 'unique') {
          console.log("username is good to go");
          this.setState({usernameIsValid: true})
        } else {
          console.log("username is not valid");
          this.setState({usernameIsValid: false})
        }
      })
      .catch(function(err) {
          console.log(err);
      })
    }
  }

  handleSave(e) {
    var body = {}
    const profile = this.props.profileInfo
    if (this.state.usernameInput !== profile.username) {
      body.username = this.state.usernameInput
    }
    if (this.state.profileNameInput !== profile.profileName) {
      body.profileName = this.state.profileNameInput
    }
    if (this.state.locationInput !== profile.location) {
      body.location = this.state.locationInput
    }
    if (this.state.descriptionInput !== profile.description) {
      body.description = this.state.descriptionInput
    }

    if (Object.getOwnPropertyNames(body).length === 0) {
      this.toggleModal()
    } else {
      fetch('/api/editProfileInfo', {
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
        console.log(data);
        if (data.message === 'success') {
          this.props.fetchProfileInfo()
          this.props.getStream()
          this.toggleModal()
          this.props.setUser({username: this.state.usernameInput, profileName: this.state.profileNameInput, profile_image_src: this.props.profileInfo.profile_image_src})
        }
      })
    }
  }

  toggleModal(e) {
    this.setState({showModal: !this.state.showModal})
  }

  render() {
    const profile = this.props.profileInfo
    return (
      <div>
        <button className="profile_info_text" id="edit_profile_button" onClick={this.toggleModal}>Edit</button>
        <Modal show={this.state.showModal} onHide={this.toggleModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body id="edit_profile_modal_body">
            <div className="edit_profile_wrapper">
              <div>
                <div className="edit_profile_image" style={{backgroundImage: 'url(' + profile.profile_image_src + ')'}}>
                  <div>
                    <label htmlFor="input_image_button" id="update_profile_image_label">Update</label>
                    <input id="input_image_button" type="file" name="post_pic" accept="image/*"
                      onChange={this.props.readImageFile}></input>
                  </div>
                </div>
              </div>
              <div className="edit_profile_form">
                <label>Username:</label>
                <input type="text" autoComplete="off" name="usernameInput" onChange={this.checkUsername} onBlur={this.checkUsername}
                  style={{boxShadow: (this.state.usernameIsValid ? (this.state.usernameInput === profile.username ?
                    "" : "0 1px 0px 0px green") : "0 1px 0px 0px red")}} value={this.state.usernameInput}></input>
                <label>Profile Name:</label>
                <input type="text" autoComplete="off" name="profileNameInput" onChange={this.handleChange} value={this.state.profileNameInput}
                  style={{boxShadow: this.state.profileNameInput === profile.profileName ? "" : "0 1px 0px 0px green"}}></input>
                <label>Location:</label>
                <input type="text" autoComplete="off" name="locationInput" onChange={this.handleChange} value={this.state.locationInput}
                  style={{boxShadow: this.state.locationInput === profile.location ? "" : "0 1px 0px 0px green"}}></input>
                <label>Description:</label>
                <textarea type="text" autoComplete="off" name="descriptionInput" rows="5" onChange={this.handleChange} value={this.state.descriptionInput}
                  style={{border: this.state.descriptionInput === profile.description ? "" : "1px solid green"}}></textarea>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button type="button" className="btn btn-default" onClick={this.handleSave} disabled={!this.state.usernameIsValid}>Save</button>
          </Modal.Footer>
        </Modal>
      </div>

    );
  }
}
