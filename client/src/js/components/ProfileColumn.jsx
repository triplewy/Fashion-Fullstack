import React from 'react';

export default class ProfileColumn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    return (
      <div>
        <div id="profile_info">
          <img id="profile_info_image" alt="" src={this.props.profileInfo.profile_image_src}></img>
          <div id="profile_info_text_div">
            <p className="profile_info_text" id="profile_info_username">{this.props.profileInfo.profileName}</p>
            <p className="profile_info_text" id="profile_info_location">{this.props.profileInfo.location}</p>
          </div>
        </div>
        <div id="profile_description">
          <p className="profile_info_text" id="profile_info_followers">Followers: {this.props.profileInfo.followers}</p>
          <p className="profile_info_text" id="profile_info_following">Following: {this.props.profileInfo.following}</p>
          <p id="profile_description_text">{this.props.profileInfo.description}</p>
        </div>

        <div className="collections_div">
        <p className="profile_column_title">Likes</p>
        <p className="see_all_link">See all</p>
        <hr id="stats_title_hr"></hr>
          <ul id="likes_list">
            <li className="likes_list_item">
              <img className="likes_list_item_image" alt="" src="../images/tkd-paris.jpg"></img>
            </li>
            <li className="likes_list_item">
              <img className="likes_list_item_image" alt="" src="../images/tkd-nyc.jpg"></img>
            </li>
            <li className="likes_list_item">
              <img className="likes_list_item_image" alt="" src="../images/tkd.jpg"></img>
            </li>
          </ul>
        </div>

        <div className="collections_div">
        <p className="profile_column_title">Inspo Albums</p>
        <a className="see_all_link" href="">See all</a>
        <hr id="stats_title_hr"></hr>
          <ul id="albums_list">
            <li className="albums_list_item">
              <div className="albums_list_item_polaroid">
                <p className="albums_list_item_title">TKD</p>
                <img className="albums_list_item_image" alt="" src="../images/tkd-paris.jpg"></img>
              </div>
            </li>
            <li className="albums_list_item">
              <div className="albums_list_item_polaroid">
                <p className="albums_list_item_title">Jbin</p>
                <img className="albums_list_item_image" alt="" src="../images/jbin-1.jpg"></img>
              </div>
            </li>
            <li className="albums_list_item">
              <div className="albums_list_item_polaroid">
                <p className="albums_list_item_title">TKD</p>
                <img className="albums_list_item_image" alt="" src="../images/tkd.jpg"></img>
              </div>
            </li>
          </ul>
        </div>
    </div>
    );
  }
}
