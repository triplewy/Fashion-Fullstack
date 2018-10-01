import React from 'react';
import like_icon_liked from 'images/heart-icon-liked.png'
import repost_icon_reposted from 'images/repost-icon-reposted.png'
import comment_icon from 'images/comment-icon.png'
import follow_icon from 'images/followers-icon-followed.png'
import ProfileHover from './ProfileHover.jsx'
import {Link} from 'react-router-dom'
import {dateDiffInDays} from './DateHelper.js'
import { setAspectRatioNotification } from './aspectRatio.js'

export default class NotificationItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    var item = this.props.item
    var index = this.props.index
    if (item.post) {
      item = item.post
      var [width, height] = setAspectRatioNotification(item.image.width, item.image.height)
      return (
        <li key={index}>
          <div>
            <ProfileHover classStyle={"post_profile_link"} username={item.username} profileName={item.profileName}
              profile_image_src={item.profile_image_src} />
            <div>
              <div className="activity_type" alt="activity type"
                style={{backgroundImage: 'url(' + (item.activity === 0 ? like_icon_liked : (item.activity === 1 ? repost_icon_reposted : comment_icon)) + ')'}} />
            </div>
            <div className="post_link">
              <Link to={"/" + item.postUsername + "/" + item.postUrl} onClick={this.props.closeDropdown}>
                <div alt="" style={{backgroundImage: 'url(' + item.image.imageUrl + ')', width: width, height: height}} className="notification_post_image" />
              </Link>
            </div>
            <div className="notification_date">
              <p>{dateDiffInDays(new Date(item.dateTime))}</p>
            </div>
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
          <div>
            <ProfileHover classStyle={"post_profile_link"} username={item.username} profileName={item.profileName}
              profile_image_src={item.profile_image_src} onClick={this.props.closeDropdown}/>
            <div>
              <div className="activity_type" alt="activity type"
                style={{backgroundImage: 'url(' + (item.activity === 0 ? like_icon_liked : (item.activity === 1 ? repost_icon_reposted : (item.activity === 2 ? comment_icon : follow_icon))) + ')'}} />
            </div>
            <div className="post_link">
              <Link to={"/" + item.playlistUsermame + "/album/" + item.playlistUrl} onClick={this.props.closeDropdown}>
                <p>{item.title}</p>
              </Link>
            </div>
            <div className="notification_date">
              <p>{dateDiffInDays(new Date(item.dateTime))}</p>
            </div>
          </div>
          {item.activity === 2 &&
          <div className="notification_comment">
            <p>{item.comment}</p>
          </div>
          }
        </li>
      )
    } else if (item.playlistPost) {
      item = item.playlistPost
      const [width, height] = setAspectRatioNotification(item.image.width, item.image.height)
      return (
        <li key={this.props.index} eventkey={this.props.index}>
          <div>
            <ProfileHover classStyle={"post_profile_link"} username={item.username} profileName={item.profileName}
              profile_image_src={item.profile_image_src} onClick={this.props.closeDropdown}/>
            <div>
              <p>added</p>
            </div>
            <div className="post_link">
              <Link to={"/" + item.postUsername + "/" + item.postUrl} onClick={this.props.closeDropdown}>
                <div alt="" style={{backgroundImage: 'url(' + item.image.imageUrl + ')', width: width, height: height}} className="notification_post_image" />
              </Link>
            </div>
            <div>
              <p>to</p>
            </div>
            <div className="post_link">
              <Link to={"/" + item.playlistUsermame + "/album/" + item.playlistUrl} onClick={this.props.closeDropdown}>
                <p>{item.title}</p>
              </Link>
            </div>
            <div className="notification_date">
              <p>{dateDiffInDays(new Date(item.dateTime))}</p>
            </div>
          </div>
        </li>
      )
    } else {
      item = item.follow
      return (
        <li key={this.props.index} eventkey={this.props.index}>
          <div>
            <ProfileHover classStyle={"post_profile_link"} username={item.username} profileName={item.profileName}
              profile_image_src={item.profile_image_src} />
            <div>
              <p className="notification_followed_you_text">Followed You</p>
            </div>
            <div className="post_link">
              <button
                onClick={item.isFollowing ? this.props.handleUnfollow.bind(this, item.username, index) : this.props.handleFollow.bind(this, item.username, index)}>
                {item.isFollowing ? 'Following' : 'Follow Back'}
              </button>
            </div>
            <div className="notification_date">
              <p>{dateDiffInDays(new Date(item.dateTime))}</p>
            </div>
          </div>
        </li>
      )
    }
  }
}
