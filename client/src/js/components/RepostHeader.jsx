import React from 'react';
import DropdownProfile from './DropdownProfile.jsx'
import { Link } from 'react-router-dom';
import { dateDiffInDays } from './DateHelper.js'

export default class RepostHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadPosterHoverData: false,
      loadReposterHoverData: false
    };

    this.setLoadPosterHoverData = this.setLoadPosterHoverData.bind(this)
    this.setLoadReposterHoverData = this.setLoadReposterHoverData.bind(this)
  }

  setLoadPosterHoverData(e) {
    this.setState({loadPosterHoverData: true})
  }

  setLoadReposterHoverData(e) {
    this.setState({loadReposterHoverData: true})
  }

  render() {
    return (
      <div id="post_header">
        <div className="post_profile_link">
          <Link to={"/" + this.props.username} onMouseEnter={this.setLoadPosterHoverData}>
            <div id="profile_image_div">
              <img id="profile_image" alt="" src={this.props.profile_image_src}></img>
            </div>
            <strong id="user_name">{this.props.profileName}</strong>
          </Link>
          <DropdownProfile username={this.props.username} load={this.state.loadPosterHoverData} />
        </div>
        <p id="post_status">{"reposted " + dateDiffInDays(new Date(this.props.repostDate)) + " ago"}</p>
        <Link to={"/" + this.props.repost_username} className="post_profile_link" onMouseEnter={this.setLoadReposterHoverData}>
          <div id="profile_image_div">
            <img id="profile_image" alt="" src={this.props.repost_profile_image_src}></img>
          </div>
          <strong id="user_name">{this.props.repost_profileName}</strong>
          <DropdownProfile username={this.props.repost_username} load={this.state.loadReposterHoverData} />
        </Link>
        {this.props.genre && <button id="genre_button">{this.props.genre}</button>}
      </div>
    );
  }
}
