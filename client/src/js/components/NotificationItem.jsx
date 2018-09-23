import React from 'react';
import like_icon_liked from 'images/heart-icon-liked.png'
import repost_icon_reposted from 'images/repost-icon-reposted.png'
import comment_icon from 'images/comment-icon.png'
import follow_icon from 'images/followers-icon-followed.png'
import ProfileHover from './ProfileHover.jsx'
import {Link} from 'react-router-dom'
import {dateDiffInDays} from './DateHelper.js'
import { setAspectRatioNotification } from './aspectRatio.js'
import Cookie from 'js-cookie'

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
              <Link to={"/" + Cookie.get('username') + "/" + item.url} onClick={this.props.closeDropdown}>
                <div  alt="" style={{backgroundImage: 'url(' + item.image.imageUrl + ')', width: width, height: height}} className="notification_post_image" />
                {/* <p>{item.title}</p> */}
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
      var [width, height] = setAspectRatioNotification(item.image.width, item.image.height)
      return (
        <li key={this.props.index} eventkey={this.props.index}>
          <div>
            <ProfileHover classStyle={"post_profile_link"} username={item.username} profileName={item.profileName}
              profile_image_src={item.profile_image_src} onClick={this.props.closeDropdown}/>
            <div>
              <div className="activity_type" alt="activity type"
                style={{backgroundImage: 'url(' + (item.activity === 0 ? like_icon_liked : (item.activity === 1 ? repost_icon_reposted : comment_icon)) + ')'}} />
            </div>
            <div className="post_link">
              <Link to={"/" + Cookie.get('username') + "/album/" + item.url} onClick={this.props.closeDropdown}>
              <div alt="" style={{backgroundImage: 'url(' + item.image.imageUrl + ')', width: width, height: height}} className="notification_collection_image" />
                {/* <p>{item.title}</p> */}
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
