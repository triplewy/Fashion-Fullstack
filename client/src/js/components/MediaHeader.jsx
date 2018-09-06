// Create a new React component here!import React from 'react';
import React from 'react';
import DropdownProfile from './DropdownProfile.jsx'
import { Link } from 'react-router-dom';
import { dateDiffInDays } from './DateHelper.js'

export default class MediaHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadHoverData: false
    };

    this.setLoadHoverData = this.setLoadHoverData.bind(this)
  }

  setLoadHoverData(e) {
    this.setState({loadHoverData: true})
  }

  render() {
    return (
      <div id="post_header">
        <div className="post_profile_link">
          <Link to={"/" + this.props.username} onMouseEnter={this.setLoadHoverData}>
            {this.props.profile_image_src &&
              <div id="profile_image_div">
                <img id="profile_image" alt="" src={this.props.profile_image_src}></img>
              </div>
            }
            <strong id="user_name">{this.props.profileName}</strong>
          </Link>
          <DropdownProfile username={this.props.username} load={this.state.loadHoverData}/>
        </div>
        {this.props.uploadDate &&
          <p id="post_status">{(this.props.isPlaylist ? "posted a playlist " : "posted a fit ") + dateDiffInDays(new Date(this.props.uploadDate)) + " ago"}</p>
        }
        {this.props.genre && <button id="genre_button">{this.props.genre}</button>}
      </div>
    );
  }
}
