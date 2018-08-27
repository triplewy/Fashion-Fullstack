import React from 'react';
import notification_icon from 'images/notification-icon.png'
import socketIOClient from 'socket.io-client'
import {Dropdown} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import NotificationItem from './NotificationItem.jsx'

export default class Notifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      endpoint: 'http://localhost:8081',
      unread: 0,
      notifications: []
    };

    this.getNotifications = this.getNotifications.bind(this)
    this.handleFollow = this.handleFollow.bind(this)
    this.handleUnfollow = this.handleUnfollow.bind(this)
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
      this.setState({notifications: data.notifications, unread: 0})
    })
  }

  handleFollow(profile, index) {
    fetch('/api/' + profile + '/follow', {
      method: 'POST',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'success') {
        var tempNotifications = this.state.notifications
        if (tempNotifications[index].follow) {
          tempNotifications[index].follow.isFollowing = true
        }
        this.setState({notifications: tempNotifications})
      } else if (data.message === 'not logged in') {
        console.log("not logged in");
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleUnfollow(profile, index) {
    fetch('/api/' + profile + '/unfollow', {
      method: 'POST',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'success') {
        var tempNotifications = this.state.notifications
        if (tempNotifications[index].follow) {
          tempNotifications[index].follow.isFollowing = false
        }
        this.setState({notifications: tempNotifications})
      } else if (data.message === 'not logged in') {
        console.log("not logged in");
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    var renderedNotifications = []
    if (this.state.notifications) {
      renderedNotifications = this.state.notifications.map((item, index) => {
        return (
          <NotificationItem item={item} index={index} key={index} handleFollow={this.handleFollow} handleUnfollow={this.handleUnfollow}/>
        )
      })
    }

    return (
      <Dropdown id="notifications_dropdown" onToggle={this.getNotifications}>
        <Dropdown.Toggle className="banner_button" noCaret={true}>
          <img id="notifications_icon" alt="notifications icon" src={notification_icon}></img>
          <div className={this.state.unread ? 'notification_cirlce_show' : 'notification_cirlce_hide'}>
            {this.state.unread}
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu style={{left: '-150px'}}>
          <ul className="notifications_list">
            {renderedNotifications}
            <Link to="/you/notifications">
              <li id="see_all_notifications">
                  <p>All Notifications</p>
              </li>
            </Link>
          </ul>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
