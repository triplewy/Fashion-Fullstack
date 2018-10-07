import React from 'react';
import {Modal} from 'react-bootstrap'
import { Link } from 'react-router-dom';
import googleLogo from 'images/google-logo.png'
import redditLogo from 'images/reddit-logo.png'

const url = process.env.REACT_APP_API_URL

export default class LoginModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
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
      <Modal show={this.props.showModal} onHide={this.props.toggleLoginModal}>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body id="login_modal_body">
          <div className="welcome_text">
            <p>Use Reddit to login</p>
            <div className="oauth_div">
              {/* <a href={url + '/auth/google'}>
                <div style={{backgroundImage: 'url(' + googleLogo + ')'}} />
              </a> */}
              <a href={url + '/auth/reddit'}>
                <div style={{backgroundImage: 'url(' + redditLogo + ')'}} />
              </a>
            </div>
            <p>Or use the old fashioned way to login</p>
            <p>Did you forgot your password?</p>
          </div>
          <div id="login_input_fields">
            <input type="text" autoComplete="off" placeholder="Username"
              name="username" onChange={this.handleChange} value={this.state.username}></input>
            <input type="password" placeholder="Password" name="password" onChange={this.handleChange}
            onKeyPress={this.handleKeyPress} value={this.state.password}></input>
            <button onClick={this.handleLogin}>Login</button>
            <Link to="/signup" onClick={this.props.toggleLoginModal}>Create an account</Link>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
