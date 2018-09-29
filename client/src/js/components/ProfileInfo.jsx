import React from 'react';
import { Link } from 'react-router-dom'
import EditProfileModal from './EditProfileModal.jsx'
import profile_followers_icon from 'images/profile-followers-icon.png'
import profile_following_icon from 'images/profile-following-icon.png'
import posts_icon from 'images/posts-icon.png'

export default class ProfileInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div className="profile_section">
        <Link to="/you/followers" className="profile_section_item">
          <div className="profile_info_icon" style={{backgroundImage: 'url(' + profile_followers_icon + ')'}} />
          <p className="profile_info_text" id="profile_info_followers">{this.props.profileInfo.followers}</p>
        </Link>
        <Link to="/you/following" className="profile_section_item">
        <div className="profile_info_icon" style={{backgroundImage: 'url(' + profile_following_icon + ')'}} />
          <p className="profile_info_text" id="profile_info_following">{this.props.profileInfo.following}</p>
        </Link>
        <div className="profile_section_item">
          <div className="profile_info_icon" style={{backgroundImage: 'url(' + posts_icon + ')'}} />
          <p className="profile_info_text" id="profile_info_posts" >{this.props.profileInfo.numPosts}</p>
        </div>
        {/* <div className="profile_section_item" id="about">
          <p id="profile_description_text">About</p>
          <div className="links_dropdown">
            {this.props.profileInfo.description}
          </div>
        </div> */}
        {this.props.isProfile &&
          <EditProfileModal
            profileInfo={this.props.profileInfo}
            readImageFile={this.props.readImageFile}
            setUser={this.props.setUser}/>
        }
        {/* <div className="type_selector_dropdown_div">
          <div className="profile_dropdown_div" id="about">
            <p id="profile_description_text">About</p>
            <div className="links_dropdown">
              {this.props.profileInfo.description}
            </div>
          </div>
        </div> */}
      </div>
    )
  }
}
