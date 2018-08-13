import React from 'react';
import {Modal} from 'react-bootstrap'
import { Link } from 'react-router-dom';
import googleLogo from 'images/google-logo.png'

export default class LoginModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      showModal: this.props.showModal
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({showModal: nextProps.showModal});
  }

  handleChange(e) {
    var value = e.target.value;
    this.setState({[e.target.name]: value});
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      console.log("Enter pressed");
      this.handleLogin(e);
    }
  }

  handleLogin(e) {
    this.props.handleLogin(this.state.username, this.state.password)
  }

  render() {
    return (
      <Modal show={this.state.showModal} onHide={this.props.closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body id="login_modal_body">
          <div className="welcome_text">
            <p>Use Google, Facebook, or Reddit to login</p>
            <div className="oauth_div">
              <a href='http://localhost:8081/auth/google'>
                <img alt="google" src={googleLogo} />
              </a>
            </div>
            <p>Or use the old fashioned way to login</p>
            <p>Did you forgot your password?</p>
          </div>
          <div id="login_input_fields">
            <input type="text" autocomplete="off" placeholder="Username or Email"
              name="username" onChange={this.handleChange} value={this.state.username}></input>
            <input type="password" placeholder="Password" name="password" onChange={this.handleChange}
            onKeyPress={this.handleKeyPress} value={this.state.password}></input>
            <button onClick={this.handleLogin}>Login</button>
            <Link to="/signup">Create an account</Link>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
