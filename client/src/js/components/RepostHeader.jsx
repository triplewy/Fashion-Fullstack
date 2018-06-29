// Create a new React component here!import React from 'react';
import React from 'react';
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
    return Math.floor((Date.now() - date) / _MS_PER_MINUTE);
  }

  render() {
    return (
      <div id="post_header">
        <Link to={"/" + this.props.uploader.username}>
          <div id="profile_image_div">
            <img id="profile_image" alt="" src={this.props.uploader.profile_image_src}></img>
          </div>
          <strong id="user_name">{this.props.uploader.profileName}</strong>
        </Link>
        <p id="post_status">reposted {this.dateDiffInDays(new Date(this.props.repostDate))} minutes ago by</p>
        <Link to={"/" + this.props.reposter.username}>
          <div id="profile_image_div">
            <img id="profile_image" alt="" src={this.props.reposter.profile_image_src}></img>
          </div>
          <strong id="user_name">{this.props.reposter.profileName}</strong>
        </Link>
        <button id="genre_button">{this.props.genre}</button>
      </div>
    );
  }
}
