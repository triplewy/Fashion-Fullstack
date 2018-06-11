import React from 'react';
import Navbar from './Navbar.jsx'
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

    // this.handleKeyPress = this.handleKeyPress.bind(this);
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

  // handleKeyPress(e) {
  //   console.log("yoooooo");
  //   if (e.key === 'Enter') {
  //     console.log("Enter pressed");
  //     this.handleLogin(e);
  //   }
  // }

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
      console.log(res);
      console.log("res.status is", res.status);
      if (res.status == 200) {
        console.log(res.url);
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
      console.log(res);
      console.log("res.status is", res.status);
      if (res.status == 200) {
        console.log(res.url);
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
        <div>
          <div className="btn-group" id="login_dropdown_wrapper">
            <button type="button" className="btn btn-default dropdown-toggle" id="login_dropdown" data-toggle="dropdown">
              Sign in<span className="caret"></span></button>
              <ul className="dropdown-menu" role="menu">
                <li>
                  <button id="reddit_login_label">Reddit Login</button>

                    <div className="form-group">
                        <label className="login_label">Email address</label>
                        <input type="email" className="form-control"
                        placeholder="Enter email" name="username" onChange={this.handleChange}
                        value={this.state.username}></input>
                    </div>
                    <div className="form-group">
                        <label className="login_label">Password</label>
                        <input type="password" className="form-control"
                        placeholder="Password" name="password" onChange={this.handleChange}
                        value={this.state.password}></input>
                    </div>
                    <button type="submit" className="btn btn-default" onClick={this.handleLogin}>Submit</button>
                </li>
              </ul>
            </div>
            <div className="btn-group" id="create_account_modal">
              <button type="button" className="btn btn-default dropdown-toggle" id="create_account_button" data-toggle="dropdown">
                Create Account</button>
                <ul className="dropdown-menu" role="menu">
                  <li>
                    <div className="form-group">
                        <label className="login_label">Username</label>
                        <input type="text" className="form-control"
                        placeholder="Enter username" name="username" onChange={this.handleChange}
                        value={this.state.username}></input>
                    </div>
                      <div className="form-group">
                          <label className="login_label">Email address</label>
                          <input type="email" className="form-control"
                          placeholder="Enter email" name="email" onChange={this.handleChange}
                          value={this.state.email}></input>
                      </div>
                      <div className="form-group">
                          <label className="login_label">Password</label>
                          <input type="password" className="form-control"
                          placeholder="Password" name="password" onChange={this.handleChange}
                          value={this.state.password}></input>
                      </div>
                      <div className="form-group">
                          <label className="login_label">Confirm Password</label>
                          <input type="password" className="form-control"
                          placeholder="Password" name="confirmPassword" onChange={this.handleChange}
                          value={this.state.confirmPassword}></input>
                      </div>
                      <button type="submit" className="btn btn-default" onClick={this.handleSignup}>Submit</button>
                  </li>
                </ul>
              </div>
            <p id="title">Fashion App</p>
            <div id="search_bar_div">
              <form>
                <input id="search_bar" type="text" placeholder="Search"
                  onChange={this.onChange} value={this.state.search_value}></input>
                <button id="search_bar_button" type="submit" disabled={!this.state.search_value}>Go</button>
              </form>
            </div>
            <div id="trending_div">

            </div>
      </div>
    );
  }
}
