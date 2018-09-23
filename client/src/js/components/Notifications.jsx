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
      notifications: [],
      open: false
    };

    this.getNotifications = this.getNotifications.bind(this)
    this.handleFollow = this.handleFollow.bind(this)
    this.handleUnfollow = this.handleUnfollow.bind(this)
    this.closeDropdown = this.closeDropdown.bind(this)
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
    if (!this.state.open) {
      this.setState({open: true})
      fetch('/api/notificationsDropdown/' + this.state.unread, {
        credentials: 'include'
      })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        this.setState({notifications: data.notifications, unread: 0})
      })
    } else {
      this.setState({open: false})
    }

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

  closeDropdown(e) {
    this.setState({open: false})
  }

  render() {
    var renderedNotifications = []
    if (this.state.notifications) {
      renderedNotifications = this.state.notifications.map((item, index) => {
        return (
          <NotificationItem item={item} index={index} key={index} handleFollow={this.handleFollow} handleUnfollow={this.handleUnfollow} closeDropdown={this.closeDropdown}/>
        )
      })
    }

    return (
      <Dropdown id="notifications_dropdown" open={this.state.open} onToggle={this.getNotifications} pullRight={true}>
        <Dropdown.Toggle className="banner_button" noCaret={true}>
          <img id="notifications_icon" alt="notifications icon" src={notification_icon}></img>
          <div className={this.state.unread ? 'notification_cirlce_show' : 'notification_cirlce_hide'}>
            {this.state.unread}
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu>
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
