import React from 'react';
import Tags from './Tags.jsx'
import { Link } from 'react-router-dom';

import view_icon from 'images/view-icon.png'
import like_icon from 'images/heart-icon.png'
import repost_icon from 'images/repost-icon.png'
import comment_icon from 'images/comment-icon.png'
import plus_icon from 'images/plus-icon.svg'

export default class Playlist extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      followers: this.props.followers,
      likes: this.props.likes,
      reposts: this.props.reposts,
      comments: this.props.comments,
      playlist_mediaIds: [],
      playlist_posts: this.props.posts,
      playlist_index: 0
    };

    this.handleLike = this.handleLike.bind(this);
    this.handleRepost = this.handleRepost.bind(this);
    this.handleFollow = this.handleFollow.bind(this);
  }

  componentDidMount() {

  }

  handleLike(e) {

  }

  handleRepost(e) {

  }

  handleFollow(e) {

  }

  render() {
    var currentPost = this.state.playlist_posts[this.state.playlist_index]

      return (
        <div id="post_wrapper">
          <div id="polaroid_div">
            <div id="post_header">
              <Link to={"/" + this.props.user.username}>
                <div id="profile_image_div">
                  <img id="profile_image" alt="" src={this.props.user.profile_image_src}></img>
                </div>
              </Link>
              <div id="header_text">
                <strong id="user_name">{this.props.user.profileName}</strong>
                <p id="post_status">Updated a Playlist 2 hours ago</p>
                <button id="genre_button">
                    <p id="genre_text">{this.props.genre}</p>
                </button>
              </div>
            </div>
            <Link to={{ pathname: '/' + currentPost.user.username + '/' + currentPost.mediaId, state: { post_data: currentPost} }}>
            <div id="image_wrapper">
              <img id="post_image" alt="" src={currentPost.post_image_src}></img>
            </div>
          </Link>
            <div id="stats_header">
              <button id="views" className="stats_button">
                <img id="views_icon" alt="view icon" className="stats_icon" src={view_icon}></img>
                <p className="stats_number" id="view_number">{currentPost.views}</p>
              </button>
              <button id="likes" className="stats_button" onClick={this.handleLike}>
                  <label id="toggle_like">❤</label>
                <img id="like_icon" alt="like icon" className="stats_icon" src={like_icon}></img>
                <p className="stats_number" id="like_number">{currentPost.likes}</p>
              </button>
              <button id="reposts" className="stats_button" onClick={this.handleRepost}>
                <img id="repost_icon" alt="repost icon" className="stats_icon" src={repost_icon}></img>
                <p className="stats_number" id="repost_number">{currentPost.reposts}</p>
              </button>
            <button id="comments" className="stats_button">
              <img id="comment_icon" alt="comment icon" className="stats_icon" src={comment_icon}></img>
              <p className="stats_number" id="comment_number">{currentPost.comments}</p>
            </button>
          </div>
        </div>
            <div id="tags_div_wrapper">
              <div id="title">
                <p id="title_text">{this.props.title}</p>
              </div>
              <hr id="tag_title_hr"></hr>
              <Tags tags={currentPost.tags}/>
          </div>
          <hr id="post_hr"></hr>
        </div>
    );
  }
}
