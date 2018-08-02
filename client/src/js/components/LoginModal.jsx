import React from 'react';
import {Modal} from 'react-bootstrap'

export default class LoginModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      showModal: this.props.show
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.close = this.close.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({showModal: nextProps.show});
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
        this.props.login('success')
        this.setState({showModal: false});
      }
    }).catch(function(err) {
        console.log(err);
    });
  }

  close(e){
    this.setState({ showModal: false });
  }

  render() {
    return (
      <Modal show={this.state.showModal} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body id="login_modal_body">
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
              onKeyPress={this.handleKeyPress} value={this.state.password}></input>
          </div>
          <button type="submit" className="btn btn-default" onClick={this.handleLogin}>Submit</button>
        </Modal.Body>
      </Modal>
    );
  }
}
