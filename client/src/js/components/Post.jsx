// Create a new React component here!import React from 'react';
import React from 'react';
import Tags from './Tags.jsx'
import RepostHeader from './RepostHeader.jsx'
import StatsHeader from './StatsHeader.jsx'
import Comments from './Comments.jsx'
import { Link } from 'react-router-dom';

const _MS_PER_MINUTE = 1000 * 60;

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: this.props.comments
    };

    this.dateDiffInDays = this.dateDiffInDays.bind(this);
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
      <div id="post_wrapper">
        <div id="polaroid_div">
          {this.props.repost_username ? <RepostHeader username={this.props.username} profileName={this.props.profileName}
            profile_image_src={this.props.profile_image_src} repost_username={this.props.repost_username}
            repost_profileName={this.props.repost_profileName} repost_profile_image_src={this.props.repost_profile_image_src}
            genre={this.props.genre} repostDate={this.props.repostDate}/> :
            <div id="post_header">
              <Link to={"/" + this.props.username}>
                <div id="profile_image_div">
                  <img id="profile_image" alt="" src={this.props.profile_image_src}></img>
                </div>
                <strong id="user_name">{this.props.profileName}</strong>
              </Link>
              <p id="post_status">{this.dateDiffInDays(new Date(this.props.uploadDate))}</p>
              <button id="genre_button">{this.props.genre}</button>
            </div>
          }
          <Link to={{ pathname: '/' + this.props.username + '/' + this.props.mediaId, state: { post_data: this.props}}}>
          <div id="image_wrapper">
            <img id="post_image" alt="" src={this.props.post_image_src}></img>
          </div>
        </Link>
        <div id="stats_wrapper">
          <StatsHeader mediaId={this.props.mediaId} views={this.props.views} likes={this.props.likes} reposts={this.props.reposts}
            reposted={this.props.reposted} liked={this.props.liked}/>
        </div>
      </div>
      <div id="tags_div_wrapper">
        <div id="title">
          <p id="title_text">{this.props.title}</p>
        </div>
        <hr id="tag_title_hr"></hr>
        <Tags tags={this.props.tags}/>
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
