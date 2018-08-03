import React from 'react';
import DropdownProfile from './DropdownProfile.jsx'
import { Link } from 'react-router-dom';

const _MS_PER_MINUTE = 1000 * 60;

export default class RepostHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.dateDiffInDays = this.dateDiffInDays.bind(this);
  }

  dateDiffInDays(date) {
    var uploadDate = Math.floor((Date.now() - date) / _MS_PER_MINUTE)
    if (uploadDate > 1439) {
      uploadDate = "reposted " + Math.floor((Date.now() - date) / (_MS_PER_MINUTE * 60 * 24)) + " days ago by"
    } else if (uploadDate > 59) {
      uploadDate = "reposted " + Math.floor((Date.now() - date) / (_MS_PER_MINUTE * 60)) + " hours ago by"
    } else {
      uploadDate = "reposted " + uploadDate + " minutes ago by"
    }
    return uploadDate
  }

  render() {
    return (
      <div id="post_header">
        <div className="post_profile_link">
          <Link to={"/" + this.props.username}>
            <div id="profile_image_div">
              <img id="profile_image" alt="" src={this.props.profile_image_src}></img>
            </div>
            <strong id="user_name">{this.props.profileName}</strong>
          </Link>
          <DropdownProfile username={this.props.username} location={this.props.location}
            userFollowers={this.props.userFollowers} userFollowed={this.props.userFollowed} />
        </div>
        <p id="post_status">{this.dateDiffInDays(new Date(this.props.repostDate))}</p>
        <Link to={"/" + this.props.repost_username} className="post_profile_link">
          <div id="profile_image_div">
            <img id="profile_image" alt="" src={this.props.repost_profile_image_src}></img>
          </div>
          <strong id="user_name">{this.props.repost_profileName}</strong>
          <DropdownProfile username={this.props.repost_username} location={this.props.repost_location}
            userFollowers={this.props.repost_userFollowers} userFollowed={this.props.repost_userFollowed} />
        </Link>
        {this.props.genre && <button id="genre_button">{this.props.genre}</button>}
      </div>
    );
  }
}
