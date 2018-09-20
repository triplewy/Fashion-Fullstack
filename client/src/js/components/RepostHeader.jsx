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
        <div className="post_status">
          <p>{"reposted " + dateDiffInDays(new Date(this.props.repostDate)) + " ago"}</p>
        </div>
        <ProfileHover classStyle="post_profile_link" username={this.props.repost_username} profileName={this.props.repost_profileName}
          profile_image_src={this.props.repost_profile_image_src} />
        <div className="genre">
          {this.props.genre && <Link to={"/explore/" + this.props.genre}>{this.props.genre.replace(/^\w/, c => c.toUpperCase())}</Link>}
        </div>
      </div>
    );
  }
}
