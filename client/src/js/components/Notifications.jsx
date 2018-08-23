import React from 'react';
import notification_icon from 'images/notification-icon.png'
import socketIOClient from 'socket.io-client'
import {Dropdown} from 'react-bootstrap'
import RenderedNotifications from './RenderedNotifications.jsx'

export default class Notifications extends React.Component {
  constructor(props) {
    super(props);
    console.log("Notifications component created");
    this.state = {
      endpoint: 'http://localhost:8081',
      unread: 0,
      notifications: []
    };

    this.getNotifications = this.getNotifications.bind(this)
  }

  componentDidMount() {
    console.log("notifications mounted");
    this.send()
    var socket = socketIOClient(this.state.endpoint);
    socket.on('unread notifications', numUnreads => {
      console.log("unread received");
      if (numUnreads !== this.state.unread) {
        this.setState({unread: numUnreads})
      }
    })
  }

  send() {
    var socket = socketIOClient(this.state.endpoint);
    socket.emit('receive notifications')
  }

  getNotifications() {
    fetch('/api/notificationsDropdown/' + this.state.unread, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({notifications: data.notifications, unread: 0})
    })
  }

  render() {
    console.log("unreads are", this.state.unread);
    return (
      <Dropdown id="notifications_dropdown" onToggle={this.getNotifications}>
        <Dropdown.Toggle className="banner_button" noCaret={true}>
          <img id="notifications_icon" alt="notifications icon" src={notification_icon}></img>
          <div className={this.state.unread ? 'notification_cirlce_show' : 'notification_cirlce_hide'}>
            {this.state.unread}
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu style={{left: '-150px'}}>
          <RenderedNotifications notifications={this.state.notifications}/>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
