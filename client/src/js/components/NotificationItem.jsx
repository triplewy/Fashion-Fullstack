import React from 'react';
import like_icon_liked from 'images/heart-icon-liked.png'
import repost_icon_reposted from 'images/repost-icon-reposted.png'
import comment_icon from 'images/comment-icon.png'
import follow_icon from 'images/followers-icon-followed.png'
import Cookie from 'js-cookie'
import {Link} from 'react-router-dom'
import {dateDiffInDays} from './DateHelper.js'

export default class NotificationItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      item: this.props.item,
      index: this.props.index
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({item: nextProps.item, index: nextProps.index})
  }

  render() {
    var item = this.state.item
    var index = this.state.index
    if (item.post) {
      item = item.post
      return (
        <li key={index} eventkey={index}>
          <div className="post_profile_link">
            <Link to={"/" + item.user.username}>
              <div id="profile_image_div">
                <img id="profile_image" alt="" src={item.user.profile_image_src}></img>
              </div>
              <strong id="user_name">{item.user.profileName}</strong>
            </Link>
          </div>
          <img className="activity_type" src={item.activity === 0 ? like_icon_liked : (item.activity === 1 ? repost_icon_reposted : comment_icon)} alt="activity type"></img>
          <div className="post_link">
            <Link to={"/" + Cookie.get('username') + "/" + item.mediaId}>
              <img  alt="" src={item.imageUrl} className="notification_post_image"></img>
              <p>{item.title}</p>
            </Link>
          </div>
          <div className="notification_date">
            <p>{dateDiffInDays(new Date(item.dateTime))}</p>
          </div>
          {item.activity === 2 &&
          <div className="notification_comment">
            <p>{item.comment}</p>
          </div>
          }
        </li>
      )
    } else if (item.playlist) {
      item = item.playlist
      return (
        <li key={this.props.index} eventkey={this.props.index}>
          <div className="post_profile_link">
            <Link to={"/" + item.user.username}>
              <div id="profile_image_div">
                <img id="profile_image" alt="" src={item.user.profile_image_src}></img>
              </div>
              <strong id="user_name">{item.user.profileName}</strong>
            </Link>
          </div>
          <img className="activity_type" src={item.activity === 0 ? like_icon_liked : (item.activity === 1 ? repost_icon_reposted : (item.activity ===2 ? comment_icon : follow_icon))} alt="activity type"></img>
          <div className="post_link">
            <Link to={"/" + Cookie.get('username') + "/" + item.playlistId}>
              <div>
                <img  alt="" src={item.imageUrl}></img>
              </div>
              <p>{item.title}</p>
            </Link>
          </div>
          <div className="notification_date">
            <p>{dateDiffInDays(new Date(item.dateTime))}</p>
          </div>
          {item.activity === 2 &&
          <div className="notification_comment">
            <p>{item.comment}</p>
          </div>
          }
        </li>
      )

    } else {
      item = item.follow
      return (
        <li key={this.props.index} eventkey={this.props.index}>
          <div className="post_profile_link">
            <Link to={"/" + item.user.username}>
              <div id="profile_image_div">
                <img id="profile_image" alt="" src={item.user.profile_image_src}></img>
              </div>
              <strong id="user_name">{item.user.profileName}</strong>
            </Link>
          </div>
          <p className="notification_followed_you_text">Followed You</p>
          <button
            onClick={item.isFollowing ? this.props.handleUnfollow.bind(this, item.user.username, index) : this.props.handleFollow.bind(this, item.user.username, index)}>
            {item.isFollowing ? 'Following' : 'Follow Back'}
          </button>
          <div className="notification_date">
            <p>{dateDiffInDays(new Date(item.dateTime))}</p>
          </div>
        </li>
      )
    }
  }
}
