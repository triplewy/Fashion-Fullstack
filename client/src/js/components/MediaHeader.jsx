import React from 'react';
import ProfileHover from './ProfileHover.jsx'
import { Link } from 'react-router-dom';
import { dateDiffInDays } from './DateHelper.js'

export default class MediaHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div id="post_header">
        <ProfileHover classStyle={this.props.classStyle} username={this.props.username} profileName={this.props.profileName}
          profile_image_src={this.props.profile_image_src} />
        {this.props.uploadDate &&
          <p id="post_status">{(this.props.isPlaylist ? "posted a playlist " : "posted a fit ") + dateDiffInDays(new Date(this.props.uploadDate)) + " ago"}</p>
        }
        {this.props.genre &&
          <Link to={"/explore/" + this.props.genre} id="genre_button">{this.props.genre}</Link>}
      </div>
    );
  }
}
