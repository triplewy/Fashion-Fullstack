import React from 'react';
import validator from 'validator';
import owasp from 'owasp-password-strength-test'

export default class Signup extends React.Component {
  constructor(props) {
    super(props);

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
      passwordErrorMessage: ''
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSignup = this.handleSignup.bind(this);
    this.checkEmail = this.checkEmail.bind(this)
    this.checkUsername = this.checkUsername.bind(this)
    this.checkPassword = this.checkPassword.bind(this)
  }

  componentDidMount() {

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
      this.props.handleLogin(this.state.loginUsername, this.state.loginPassword)
    }
  }

  handleSignup(e) {
    if (this.state.password === this.state.confirmPassword) {
      console.log(true);
    }
    fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: this.state.email,
        username: this.state.username,
        password: this.state.password,
      })
    })
    .then(res => {
      console.log("res.status is", res.status);
      if (res.status === 200) {
        this.setState({redirect: true, redirectURL: res.url});
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
    return (
      <div id="white_background_wrapper">
        <div className="signup_div" style={{'borderRight': '1px solid black'}}>
          <div className="signup_form_div">
            <p>Login</p>
            <div className="form-group">
                <label className="login_label">Username or Email</label>
                <input type="text" className="form-control"
                placeholder="Enter Username or Email" name="loginUsername" onChange={this.handleChange}
                value={this.state.username}></input>
            </div>
            <div className="form-group">
                <label className="login_label">Password</label>
                <input type="password" className="form-control"
                name="loginPassword" onChange={this.handleChange}
                onKeyPress={this.handleKeyPress} value={this.state.password}></input>
            </div>
            <button id="reddit_login_label">Reddit Login</button>
            <button type="submit" className="btn btn-default" onClick={this.props.handleLogin.bind(this.state.loginUsername, this.state.loginPassword)}>
              Login
            </button>
          </div>
        </div>
        <div className="signup_div">
          <div className="signup_form_div">
            <p>Signup</p>
            <div className="form-group">
                <label className="login_label">Email</label>
                <input type="email" className="form-control"
                placeholder="Enter email" name="signupEmail" onChange={this.handleChange}
                onBlur={this.checkEmail}
                value={this.state.signupEmail}></input>
                {this.state.emailIsValid ? <span className="signup_validator">✔</span> : <span className="signup_validator">x</span>}
            </div>
            <div className="form-group">
                <label className="login_label">Username</label>
                <input type="text" className="form-control"
                placeholder="Enter username" name="signupUsername" onChange={this.handleChange}
                onBlur={this.checkUsername}
                value={this.state.signupUsername}></input>
                {this.state.usernameIsValid ? <span className="signup_validator">✔</span> : <span className="signup_validator">x</span>}
            </div>
            <div className="form-group">
                <label className="login_label">Password</label>
                <input type="password" className="form-control"
                name="signupPassword" onChange={this.handleChange}
                onBlur={this.checkPassword}
                value={this.state.signupPassword}></input>
                {this.state.passwordIsValid ? <span className="signup_validator">✔</span> : <span className="signup_validator">x</span>}
                <p>{this.state.passwordErrorMessage}</p>
            </div>
            <div className="form-group">
                <label className="login_label">Confirm Password</label>
                <input type="password" className="form-control"
                name="signupConfirmPassword" onChange={this.handleChange}
                value={this.state.signupConfirmPassword}></input>
                {(this.state.signupPassword === this.state.signupConfirmPassword) && this.state.signupConfirmPassword ? <span className="signup_validator">✔</span> : <span className="signup_validator">x</span>}

            </div>
            <button className="btn btn-default" onClick={this.handleSignup}
              disabled={!(this.state.emailIsValid && this.state.usernameIsValid && this.state.passwordIsValid && (this.state.signupPassword === this.state.signupConfirmPassword))}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }
}
