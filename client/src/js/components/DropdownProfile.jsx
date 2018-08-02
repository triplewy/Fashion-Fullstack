import React from 'react';

export default class DropdownProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFollowing: this.props.isFollowing
    };

    this.handleFollow = this.handleFollow.bind(this);
    this.handleUnfollow = this.handleUnfollow.bind(this);
  }

  handleFollow(e) {
    fetch('/api/' + this.props.username + '/follow', {
      method: 'POST',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
      if (data.message == 'success') {
        this.setState({isFollowing: true})
      }
    })
  }

  handleUnfollow(e) {
    fetch('/api/' + this.props.username + '/unfollow', {
      method: 'POST',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
      if (data.message == 'success') {
        this.setState({isFollowing: false})
      }
    })
  }

  render() {
    return (
      <div className="dropdown">
        <p className="dropdown_text">{this.props.location}</p>
        <p className="dropdown_text">{'Followers: ' + this.props.userFollowers}</p>
        <button id="dropdown_follow" onClick={this.state.isFollowing ? this.handleUnfollow : this.handleFollow}>
          {this.state.isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    );
  }
}
