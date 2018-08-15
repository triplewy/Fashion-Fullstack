import React from 'react';

export default class DropdownProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userFollowers: this.props.userFollowers,
      userFollowed: this.props.userFollowed
    };

    this.handleFollow = this.handleFollow.bind(this);
    this.handleUnfollow = this.handleUnfollow.bind(this);
  }

  handleFollow(e) {
    e.stopPropagation()
    fetch('/api/' + this.props.username + '/follow', {
      method: 'POST',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
      if (data.message == 'success') {
        this.setState({userFollowed: true, userFollowers: this.state.userFollowers + 1})
      }
    })
  }

  handleUnfollow(e) {
    e.stopPropagation()
    fetch('/api/' + this.props.username + '/unfollow', {
      method: 'POST',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
      if (data.message == 'success') {
        this.setState({userFollowed: false, userFollowers: this.state.userFollowers - 1})
      }
    })
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
        <p className="dropdown_text">{this.props.location}</p>
        <p className="dropdown_text">{'Followers: ' + this.state.userFollowers}</p>
        {!this.props.isProfile &&
          <button id="dropdown_follow" onClick={this.state.userFollowed ? this.handleUnfollow : this.handleFollow}
            style={{color: this.state.userFollowed ? 'red' : 'black'}}>
            {buttonText}
          </button>
        }
      </div>
    );
  }
}
