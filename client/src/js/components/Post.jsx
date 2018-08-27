// Create a new React component here!import React from 'react';
import React from 'react';
import Tags from './Tags.jsx'
import RepostHeader from './RepostHeader.jsx'
import StatsHeader from './StatsHeader.jsx'
import Comments from './Comments.jsx'
import DropdownProfile from './DropdownProfile.jsx'
import { Link } from 'react-router-dom';

const _MS_PER_MINUTE = 1000 * 60;

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: this.props.comments,
      bottom: 0
    };

    this.dateDiffInDays = this.dateDiffInDays.bind(this);
    this.handleScroll = this.handleScroll.bind(this)
  }

  componentDidMount() {
    console.log("post mounted");
    window.addEventListener('scroll', this.handleScroll);
    var body = document.body.getBoundingClientRect()
    var element = document.getElementById('post_wrapper_' + this.props.index).getBoundingClientRect()
    var offset = element.top - body.top
    console.log("post bottom is", offset);
    this.setState({bottom: offset})
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll() {
    if (window.scrollY >= this.state.bottom) {
      console.log("hit bottom");
    }
  }

  addNewPlaylist(e) {
    this.setState({displayPlaylist: true})
  }

  dateDiffInDays(date) {
    var uploadDate = Math.floor((Date.now() - date) / _MS_PER_MINUTE)
    if (uploadDate > 1439) {
      uploadDate = "posted a fit " + Math.floor((Date.now() - date) / (_MS_PER_MINUTE * 60 * 24)) + " days ago"
    } else if (uploadDate > 59) {
      uploadDate = "posted a fit " + Math.floor((Date.now() - date) / (_MS_PER_MINUTE * 60)) + " hours ago"
    } else {
      uploadDate = "posted a fit " + uploadDate + " minutes ago"
    }
    return uploadDate
  }

  render() {
    return (
      <div className="post_wrapper" id={"post_wrapper_" + this.props.index}>
        <div id="polaroid_div">
          {this.props.repost_username ? <RepostHeader username={this.props.username} profileName={this.props.profileName}
            location={this.props.location} userFollowers={this.props.userFollowers} userFollowed={this.props.userFollowed}
            profile_image_src={this.props.profile_image_src} repost_username={this.props.repost_username}
            repost_profileName={this.props.repost_profileName} repost_profile_image_src={this.props.repost_profile_image_src}
            repost_location={this.props.repost_location} repost_userFollowers={this.props.repost_userFollowers}
            repost_isFollowing={this.props.repost_isFollowing} genre={this.props.genre} repostDate={this.props.repostDate}
            repost_userFollowed={this.props.repost_userFollowed} followsYou={this.props.followsYou} isPoster={this.props.isPoster} isReposter={this.props.isReposter}/> :
            <div id="post_header">
              <div className="post_profile_link">
                <Link to={"/" + this.props.username}>
                  <div id="profile_image_div">
                    <img id="profile_image" alt="" src={this.props.profile_image_src}></img>
                  </div>
                  <strong id="user_name">{this.props.profileName}</strong>
                </Link>
                <DropdownProfile username={this.props.username} location={this.props.location}
                  userFollowers={this.props.userFollowers} userFollowed={this.props.userFollowed} followsYou={this.props.followsYou}
                  isProfile={this.props.isPoster}/>
              </div>
              <p id="post_status">{this.dateDiffInDays(new Date(this.props.uploadDate))}</p>
              {this.props.genre && <button id="genre_button">{this.props.genre}</button>}
            </div>
          }
          <Link to={{ pathname: '/' + this.props.username + '/' + this.props.mediaId, state: { post_data: this.props}}}>
          <div id="image_wrapper">
            <img id="post_image" alt="" src={this.props.post_image_src}></img>
          </div>
        </Link>
        <div id="stats_wrapper">
          <StatsHeader mediaId={this.props.mediaId} views={this.props.views} likes={this.props.likes} reposts={this.props.reposts}
            reposted={this.props.reposted} liked={this.props.liked} isPoster={this.props.isPoster}/>
        </div>
      </div>
      <div id="tags_div_wrapper">
        <div id="title">
          <p id="title_text">{this.props.title}</p>
        </div>
        <div id="og_tag">
          {this.props.original !== 0 && <span>✔</span>}
        </div>
        <hr id="tag_title_hr"></hr>
        <Tags tags={this.props.tags} modify={false}/>
        <div id="description_wrapper">
          <p id="description">{this.props.description}</p>
        </div>
        <Comments mediaId={this.props.mediaId} username={this.props.username} comments={this.state.comments} />
      </div>
      <hr id="post_hr"></hr>
    </div>
    );
  }
}
