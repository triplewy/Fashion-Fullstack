import React from 'react';
import {Redirect} from 'react-router-dom';

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      email: '',
      password: '',
      confirmPassword:'',
      redirect: false,
      redirectURL: ''
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
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

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      console.log("Enter pressed");
      this.handleLogin(e);
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
        username: this.state.username,
        password: this.state.password,
      })
    })
    .then(res => {
      if (res.redirected) {
        this.setState({redirect: true, redirectURL: res.url});
      }
    }).catch(function(err) {
        console.log(err);
    });
  }

  handleSignup(e) {
    if (this.state.password == this.state.confirmPassword) {
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
        username: this.state.username,
        email: this.state.email,
        password: this.state.password,
      })
    })
    .then(res => {
      console.log("res.status is", res.status);
      if (res.status == 200) {
        this.setState({redirect: true, redirectURL: res.url});
      }
    }).catch(function(err) {
        console.log(err);
    });
  }

  render() {
      if (this.state.redirect) {
        return <Redirect to={'/'}/>
      }
      return (
        <div id="white_background_wrapper">

            <p id="title">Fashion App</p>
            
            <div id="trending_div">

            </div>
      </div>
    );
  }
}
