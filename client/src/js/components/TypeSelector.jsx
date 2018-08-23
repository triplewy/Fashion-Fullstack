import React from 'react';
import profile_followers_icon from 'images/profile-followers-icon.png'
import profile_following_icon from 'images/profile-following-icon.png'

import posts_icon from 'images/posts-icon.png'

export default class TypeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    var rendered_types = [];
    if (this.props.types != null) {
      rendered_types = this.props.types.map((item, index) => {
          return (
            <button key={index} name={index} className={(this.props.type_selector_value === index)?
              'type_selector_button_selected' : 'type_selector_button'}
              disabled={(this.props.type_selector_value === index)}
              onClick={this.props.toggle_type}>{item}</button>
          )
      });
    }
      return (
          <div id="type_selector">
            {rendered_types}
            {this.props.profileInfo &&
              <div id="profile_section">
                <img className="profile_info_icon" alt="followers icon" src={profile_followers_icon}></img>
                <p className="profile_info_text" id="profile_info_followers">{this.props.profileInfo.followers}</p>
                <img className="profile_info_icon" alt="followers icon" src={profile_following_icon}></img>
                <p className="profile_info_text" id="profile_info_following">{this.props.profileInfo.following}</p>
                <img className="profile_info_icon" alt="posts icon" src={posts_icon} name='2' onClick={this.props.toggle_type} style={{cursor: 'pointer'}}></img>
                <p className="profile_info_text" id="profile_info_posts" name='2' onClick={this.props.toggle_type} style={{cursor: 'pointer'}}>{this.props.profileInfo.numPosts}</p>
                {this.props.profileInfo.editable &&
                  <button className="profile_info_text" id="edit_profile_button" onClick={this.props.editProfile.bind(this)}>Edit</button>
                }
              </div>
            }
            {this.props.profileInfo &&
              <div className="type_selector_dropdown_div">
                <div className="profile_dropdown_div" id="about">
                  <p id="profile_description_text">About</p>
                  <div className="links_dropdown">
                    "This is the about my section"
                  </div>
                </div>
                <div className="profile_dropdown_div" id="links">
                  <p id="profile_description_text">Links</p>
                  <div className="links_dropdown">
                    {this.props.profileInfo.description}
                  </div>
                </div>
              </div>
            }
          </div>
    );
  }
}
