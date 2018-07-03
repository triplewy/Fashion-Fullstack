import React from 'react';
import Tags from './Tags.jsx'
import RepostHeader from './RepostHeader.jsx'
import StatsHeader from './StatsHeader.jsx'
import { Link } from 'react-router-dom';

import view_icon from 'images/view-icon.png'
import like_icon from 'images/heart-icon.png'
import repost_icon from 'images/repost-icon.png'
import comment_icon from 'images/comment-icon.png'
import plus_icon from 'images/plus-icon.png'

const _MS_PER_MINUTE = 1000 * 60;

{/* <img className="playlist_post_stat_button" src={view_icon}></img>
<p className="playlist_post_stat">{item.views}</p>
<img className="playlist_post_stat_button" src={like_icon}></img>
<p className="playlist_post_stat">{item.likes}</p>
<img className="playlist_post_stat_button" src={repost_icon}></img>
<p className="playlist_post_stat">{item.reposts}</p>
<img className="playlist_post_stat_button" src={comment_icon}></img>
<p className="playlist_post_stat">{item.comments}</p> */}

export default class Playlist extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      followers: this.props.followers,
      likes: this.props.likes,
      reposts: this.props.reposts,
      comments: this.props.comments,
      playlist_mediaIds: [],
      playlistPosts: this.props.posts,
      playlistIndex: 0
    };

    this.handleLike = this.handleLike.bind(this);
    this.handleRepost = this.handleRepost.bind(this);
    this.handleFollow = this.handleFollow.bind(this);
    this.setPlaylistIndex = this.setPlaylistIndex.bind(this)
  }

  componentDidMount() {

  }

  handleLike(e) {
    fetch('/api/playlistLike', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.id,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({likes: this.state.likes + 1})
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleRepost(e) {
    fetch('/api/playlistRepost', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.id,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({reposts: this.state.reposts + 1})
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleFollow(e) {

  }

  setPlaylistIndex(index, e) {
    console.log("index is", index);
    this.setState({playlistIndex: index})
  }

  dateDiffInDays(date) {
    var uploadDate = Math.floor((Date.now() - date) / _MS_PER_MINUTE)
    if (uploadDate > 1439) {
      uploadDate = "posted a playlist " + Math.floor((Date.now() - date) / (_MS_PER_MINUTE * 60 * 24)) + " days ago"
    } else if (uploadDate > 59) {
      uploadDate = "posted a playlist " + Math.floor((Date.now() - date) / (_MS_PER_MINUTE * 60)) + " hours ago"
    } else {
      uploadDate = "posted a playlist " + uploadDate + " minutes ago"
    }
    return uploadDate
  }

  render() {
    var currentPost = this.state.playlistPosts[this.state.playlistIndex]
    var rendered_playlist_posts = [];
    if (this.state.playlistPosts.length > 0) {
      rendered_playlist_posts = this.state.playlistPosts.map((item, index) => {
        return (
          <li key={index} value={index} onClick={this.setPlaylistIndex.bind(this, index)}
              className={(this.state.playlistIndex == index)?
                'playlist_post_selected' : null}
                disabled={(this.state.playlistIndex == index)}>
            <div id="playlist_post_user_title_div">
              <p id="playlist_post_user">{item.user.profileName}</p>
              <p id="playlist_post_title">{item.title}</p>
            </div>
            <StatsHeader is_collection={false} view_count={item.views} like_count={item.likes}
              repost_count={item.reposts} comment_count={item.comments}/>
          </li>
          )
      });
    }

      return (
        <div id="post_wrapper">
          <div id="polaroid_div">
            {this.props.reposter ? <RepostHeader reposter={this.props.reposter}
              uploader={this.props.user} genre={this.props.genre} repostDate={this.props.repostDate}/> :
              <div id="post_header">
                <Link to={"/" + this.props.user.username}>
                  <div id="profile_image_div">
                    <img id="profile_image" alt="" src={this.props.user.profile_image_src}></img>
                  </div>
                  <strong id="user_name">{this.props.user.profileName}</strong>
                </Link>
                <p id="post_status">{this.dateDiffInDays(new Date(this.props.uploadDate))}</p>
                <button id="genre_button">{this.props.genre}</button>
              </div>
            }
            <Link to={{ pathname: '/' + currentPost.user.username + '/' + currentPost.mediaId, state: { post_data: currentPost} }}>
            <div id="image_wrapper">
              <img id="post_image" alt="" src={currentPost.post_image_src}></img>
            </div>
          </Link>
            <div id="stats_header">
              <button id="likes" className="stats_button" onClick={this.handleLike}>
                  <label id="toggle_like">❤</label>
                <img id="like_icon" alt="like icon" className="stats_icon" src={like_icon}></img>
                <p className="stats_number" id="like_number">{this.state.likes}</p>
              </button>
              <button id="reposts" className="stats_button" onClick={this.handleRepost}>
                <img id="repost_icon" alt="repost icon" className="stats_icon" src={repost_icon}></img>
                <p className="stats_number" id="repost_number">{this.state.reposts}</p>
              </button>
            <button id="comments" className="stats_button">
              <img id="comment_icon" alt="comment icon" className="stats_icon" src={comment_icon}></img>
              <p className="stats_number" id="comment_number">{this.props.comments}</p>
            </button>
            <button id="followers" className="stats_button">
              <img id="follower_icon" alt="follower icon" className="stats_icon" src={comment_icon}></img>
              <p className="stats_number" id="followers_number">{this.props.followers}</p>
            </button>
          </div>
        </div>
            <div id="tags_div_wrapper">
              <div id="title">
                <p id="title_text">{this.props.title}</p>
              </div>
              <hr id="tag_title_hr"></hr>
              <Tags tags={currentPost.tags}/>
              <hr id="tag_title_hr"></hr>
              <ul id="playlist_list">
                {rendered_playlist_posts}
              </ul>
          </div>
          <hr id="post_hr"></hr>
        </div>
    );
  }
}
