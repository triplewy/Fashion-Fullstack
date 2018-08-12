import React from 'react';
import validator from 'validator';
import owasp from 'owasp-password-strength-test'
import {Link, Redirect} from 'react-router-dom'
import googleLogo from 'images/google-logo.png'

// {this.state.emailIsValid ? <span className="signup_validator">✔</span> : <span className="signup_validator">x</span>}

export default class Signup extends React.Component {
  constructor(props) {
    super(props);
    console.log("signup is constructed", props);
    this.state = {
      loginUsername: '',
      loginPassword: '',
      signupEmail: '',
      signupUsername: '',
      signupPassword: '',
      signupConfirmPassword: '',
      emailIsValid: false,
      usernameIsValid: false,
      passwordIsValid: false,
      passwordErrorMessage: '',
      redirect: false,
      redirectUrl: props.location.state ? props.location.state.from.pathname : '/'
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSignup = this.handleSignup.bind(this)
    this.handleLogin = this.handleLogin.bind(this)
    this.handleGoogleOAuth = this.handleGoogleOAuth.bind(this)
    this.checkEmail = this.checkEmail.bind(this)
    this.checkUsername = this.checkUsername.bind(this)
    this.checkPassword = this.checkPassword.bind(this)
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    this.setState({redirectUrl: nextProps.location.state ? nextProps.location.state.from.pathname : '/'})
  }

  handleChange(e) {
    var value = e.target.value;
    if (e.target.name === 'signupEmail') {
      this.setState({[e.target.name]: value, emailIsValid: validator.isEmail(value)});
    } else if (e.target.name === 'signupUsername') {
      this.setState({[e.target.name]: value, usernameIsValid: (validator.isAlphanumeric(value) && value)});
    } else if (e.target.name === 'signupPassword') {
      var owaspResult = owasp.test(value);
      this.setState({[e.target.name]: value, passwordIsValid: owaspResult.strong, passwordErrorMessage: owaspResult.errors.join(' ')});
    } else {
      this.setState({[e.target.name]: value});
    }
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleLogin()
    }
  }

  handleLogin(e) {
    fetch('/api/signin', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: this.state.loginUsername,
        password: this.state.loginPassword,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'success') {
        this.props.loggedIn()
        this.setState({redirect: true})
      }
    })
    .catch(function(err) {
        console.log(err);
    });
  }

  handleGoogleOAuth(e) {
    console.log("ayy");
    fetch('/api/auth/google', {
      method: 'GET',
      credentials: 'include',
      mode: 'no-cors'
    })
    .catch(function(err) {
        console.log(err);
    });
  }

  handleSignup(e) {
    fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: this.state.signupEmail,
        username: this.state.signupUsername,
        password: this.state.signupPassword,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'success') {
        this.props.loggedIn()
        this.setState({redirect: true})
      }
    }).catch(function(err) {
        console.log(err);
    });
  }

  checkEmail(e) {
    if (!validator.isEmail(this.state.signupEmail)) {
      console.log("not valid email");
      this.setState({emailIsValid: false})
    } else {
      fetch('/api/checkEmail', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: this.state.signupEmail
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.message === 'unique') {
          console.log("email is good to go");
          this.setState({emailIsValid: true})
        } else {
          console.log("email is not valid");
          this.setState({emailIsValid: false})
        }
      })
      .catch(function(err) {
          console.log(err);
      });
    }
  }

  checkUsername(e) {
    if (!validator.isAlphanumeric(this.state.signupUsername) && !this.state.signupUsername) {
      console.log("not valid username");
      this.setState({usernameIsValid: false})
    } else {
      fetch('/api/checkUsername', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.state.signupUsername
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

  checkPassword(e) {
    var owaspResult = owasp.test(this.state.signupPassword);
    if (owaspResult.strong) {
      console.log(owaspResult);
      this.setState({passwordIsValid: true})
    } else {
      console.log(owaspResult);
      var errorMessage = ''
      for (var i = 0; i < owaspResult.errors.length; i++) {
        errorMessage += (owaspResult.errors[i] + ' ')
      }
      this.setState({passwordIsValid: false, passwordErrorMessage: errorMessage})
    }
  }

  render() {
    if (this.state.redirect) {
      return (
        <Redirect to={this.state.redirectUrl} />
      )
    }
    return (
      <div id="white_background_wrapper">
        <div className="signup_div" >
          <p className="modal-title">Login</p>
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
            <input type="text" autoComplete="off" placeholder="Username or Email"
              name="loginUsername" onChange={this.handleChange} value={this.state.loginUsername}></input>
            <input type="password" placeholder="Password" name="loginPassword" onChange={this.handleChange}
            onKeyPress={this.handleKeyPress} value={this.state.loginPassword}></input>
            <button onClick={this.handleLogin}>Login</button>
          </div>
        </div>
        <div className="signup_div">
          <div className="signup_form_div">
            <p className="modal-title">Sign Up</p>
            <div className="welcome_text">
              <p>Use Google, Facebook, or Reddit to create an account</p>
              <div className="oauth_div">
                <a href='http://localhost:8081/auth/google'>
                  <img alt="google" src={googleLogo} />
                </a>
              </div>
              <p>Or use the old fashioned way to create an account</p>
            </div>
            <div id="login_input_fields">
              <input type="text" autoComplete="off" placeholder="Email" name="signupEmail"
                onChange={this.handleChange} onBlur={this.checkEmail}
                value={this.state.signupEmail} className={this.state.emailIsValid ? "valid_field" : ''}></input>
              <input type="text" autoComplete="off" placeholder="Username" name="signupUsername"
                onChange={this.handleChange} onBlur={this.checkUsername}
                value={this.state.signupUsername} className={this.state.usernameIsValid ? "valid_field" : ''}></input>
              <input type="text" autoComplete="off" placeholder="Password" name="signupPassword"
                onChange={this.handleChange} onBlur={this.checkPassword}
                value={this.state.signupPassword} className={this.state.passwordIsValid ? "valid_field" : ''}></input>
              <p>{this.state.passwordErrorMessage}</p>
              <input type="text" autoComplete="off" placeholder="Confirm Password" name="signupConfirmPassword"
                onChange={this.handleChange} value={this.state.signupConfirmPassword}
                className={(this.state.signupPassword === this.state.signupConfirmPassword) && this.state.signupConfirmPassword ? "valid_field" : ''}></input>
              <button onClick={this.handleSignup}
                disabled={!(this.state.emailIsValid && this.state.usernameIsValid && this.state.passwordIsValid && (this.state.signupPassword === this.state.signupConfirmPassword))}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
