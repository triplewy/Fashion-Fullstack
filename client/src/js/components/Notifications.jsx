import React from 'react';
import notification_icon from 'images/notification-icon.png'
import socketIOClient from 'socket.io-client'
import Cookie from 'js-cookie'

export default class Notifications extends React.Component {
  constructor(props) {
    super(props);
    console.log("Notifications component created");
    this.state = {
      endpoint: 'http://localhost:3001',
      unread: false,
      notifications: []
    };
  }

  componentDidMount() {
    // var socket = socketIOClient(this.state.endpoint);
    // socket.on('notification', (notification) => {
    //   this.setState({unread: true})
    // })
  }

  send() {
    var socket = socketIOClient(this.state.endpoint);
    socket.emit('receive notifications', Cookie.get('userId')) // change 'red' to this.state.color
  }


  render() {
    return (
      <div className="btn-group">
        <button className="dropdown-toggle" type="button" data-toggle="dropdown">
          <img id="notifications_icon" alt="notifications icon" className="banner_button" src={this.state.unread ? notification_icon : notification_icon}></img>
          <span className="caret"></span>
        </button>
        <ul className="dropdown-menu">
          <li className="form-group">
            Yo
          </li>
        </ul>
      </div>
    );
  }
}
