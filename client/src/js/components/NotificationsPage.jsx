import React from 'react';
import NotificationItem from './NotificationItem.jsx'

export default class NotificationsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: []
    };

    this.getNotifications = this.getNotifications.bind(this)
    this.handleFollow = this.handleFollow.bind(this)
    this.handleUnfollow = this.handleUnfollow.bind(this)

  }

  componentDidMount() {
    this.getNotifications()
  }

  getNotifications() {
    fetch('/api/notificationsDropdown/20', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({notifications: data.notifications})
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
      <div id="white_background_wrapper">
        <ul className="notificationsPage_list">
          {renderedNotifications}
        </ul>
      </div>
    );
  }
}
