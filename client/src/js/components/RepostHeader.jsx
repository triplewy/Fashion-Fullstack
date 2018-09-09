import React from 'react';
import ProfileHover from './ProfileHover.jsx'
import { Link } from 'react-router-dom';
import { dateDiffInDays } from './DateHelper.js'

export default class RepostHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div id="post_header">
        <ProfileHover classStyle="post_profile_link" username={this.props.username} profileName={this.props.profileName}
          profile_image_src={this.props.profile_image_src} />
        <p id="post_status">{"reposted " + dateDiffInDays(new Date(this.props.repostDate)) + " ago"}</p>
        <ProfileHover classStyle="post_profile_link" username={this.props.repost_username} profileName={this.props.repost_profileName}
          profile_image_src={this.props.repost_profile_image_src} />
        {this.props.genre && <Link to={"/genre/" + this.props.genre} id="genre_button">{this.props.genre}</Link>}
      </div>
    );
  }
}
