import React from 'react';
import NotLoggedInOverlay from './NotLoggedInOverlay.jsx'

export default class DropdownProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userFollowers: 0,
      userFollowed: 0,
      followsYou: false,
      location: '',
      isProfile: false,

      showOverlay: false,
      target: null
    };

    this.fetchDropdownProfile = this.fetchDropdownProfile.bind(this)
    this.handleFollow = this.handleFollow.bind(this);
    this.handleUnfollow = this.handleUnfollow.bind(this);
    this.showOverlay = this.showOverlay.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (this.props.load !== prevProps.load) {
      this.fetchDropdownProfile()
    }
  }

  fetchDropdownProfile() {
    fetch('/api/dropdownProfile/' + this.props.username, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({userFollowers: data.followers, userFollowed: data.isFollowing,
        location: data.location, followsYou: data.followsYou, isProfile: data.isProfile});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleFollow(e) {
    e.stopPropagation()
    const target = e.target
    fetch('/api/follow', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: this.props.username
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'success') {
        this.setState({userFollowed: true, userFollowers: this.state.userFollowers + 1})
      } else if (data.message === "not logged in") {
        this.showOverlay(target)
      } else {
        console.log(data);
      }
    })
  }

  handleUnfollow(e) {
    e.stopPropagation()
    const target = e.target
    fetch('/api/unfollow', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: this.props.username
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'success') {
        this.setState({userFollowed: false, userFollowers: this.state.userFollowers - 1})
      } else if (data.message === "not logged in") {
        this.showOverlay(target)
      } else {
        console.log(data);
      }
    })
  }

  showOverlay(target) {
    this.setState({showOverlay: true, target: target})
    setTimeout(function() {
      this.setState({showOverlay: false})
    }.bind(this), 2000)
  }

  render() {
    var buttonText = ''
    if (this.state.userFollowed) {
      buttonText = 'Followed'
    } else {
      if (this.props.followsYou) {
        buttonText = 'Follow Back'
      } else {
        buttonText = 'Follow'
      }
    }
    return (
      <div className="dropdown">
        <p className="dropdown_text">{this.state.location}</p>
        <p className="dropdown_text">{'Followers: ' + this.state.userFollowers}</p>
        {!this.state.isProfile &&
          <button id="dropdown_follow" onClick={this.state.userFollowed ? this.handleUnfollow : this.handleFollow}
            style={{color: this.state.userFollowed ? 'red' : 'black'}}>
            {buttonText}
          </button>
        }
        <NotLoggedInOverlay showOverlay={this.state.showOverlay} target={this.state.target} />
      </div>
    );
  }
}
