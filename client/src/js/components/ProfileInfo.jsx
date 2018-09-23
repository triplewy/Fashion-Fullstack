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
      <div id="profile_section">
        <div id="profile_section_top">
          <Link to="/you/followers">
            <img className="profile_info_icon" alt="followers icon" src={profile_followers_icon}></img>
            <p className="profile_info_text" id="profile_info_followers">{this.props.profileInfo.followers}</p>
          </Link>
          <Link to="/you/following">
            <img className="profile_info_icon" alt="followers icon" src={profile_following_icon}></img>
            <p className="profile_info_text" id="profile_info_following">{this.props.profileInfo.following}</p>
          </Link>
          <img className="profile_info_icon" alt="posts icon" src={posts_icon} name='2' onClick={this.props.toggle_type} style={{cursor: 'pointer'}}></img>
          <p className="profile_info_text" id="profile_info_posts" name='2' onClick={this.props.toggle_type} style={{cursor: 'pointer'}}>{this.props.profileInfo.numPosts}</p>
          {this.props.isProfile &&
            <EditProfileModal profileInfo={this.props.profileInfo} readImageFile={this.readImageFile} fetchProfileInfo={this.props.fetchProfileInfo}/>
          }
        </div>
        <div className="type_selector_dropdown_div">
          <div className="profile_dropdown_div" id="about">
            <p id="profile_description_text">About</p>
            <div className="links_dropdown">
              {this.props.profileInfo.description}
            </div>
          </div>
          <div className="profile_dropdown_div" id="links">
            <p id="profile_description_text">Links</p>
            <div className="links_dropdown">
              {this.props.profileInfo.description}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
