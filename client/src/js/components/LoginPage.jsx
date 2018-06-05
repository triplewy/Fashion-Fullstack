import React from 'react';
import Navbar from './Navbar.jsx'

export default class LoginPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleSignup = this.handleSignup.bind(this);
  }

  componentDidMount() {

  }

  handleChange(e) {
    var value = e.target.value;
    this.setState({[e.target.name]: value});
  }

  handleLogin(e) {

  }

  handleSignup(e) {

  }

  render() {
      return (
        <div>
          <Navbar />
          <div id="white_background_wrapper">
            <div id="login_div">
              <p id="reddit_login_label">Login through Reddit</p>
              <p id="login_label">Login</p>
              <p className="form_input_text" id="title_input">Username or Email:</p>
              <input className="input_box" type="text" name="username"
                onChange={this.handleChange} placeholder="Your username or email"
                value={this.state.username}></input>
              <p className="form_input_text" id="genre_input">Password:</p>
              <input className="input_box" type="password" name="password"
                onChange={this.handleChange} value={this.state.password}></input>
              <button id="login_button" onClick={this.handleLogin}>Log in</button>
            </div>
            <button id="signup_dropdown">Create an account</button>
              <button id="signup_button" onClick={this.handleSignup}>Sign Up</button>
          </div>
      </div>
    );
  }
}
