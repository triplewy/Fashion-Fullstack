import React from 'react';
import ProfileHover from './ProfileHover.jsx'
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
        <div className="post_status">
        {this.props.uploadDate &&
            <p>{(this.props.isPlaylist ? "posted a playlist " : "posted a fit ") + dateDiffInDays(new Date(this.props.uploadDate)) + " ago"}</p>
        }
        </div>
        {/* <div className="genre">
          {this.props.genre && <Link to={"/explore/" + this.props.genre}>{this.props.genre.replace(/^\w/, c => c.toUpperCase())}</Link>}
        </div> */}
      </div>
    );
  }
}
