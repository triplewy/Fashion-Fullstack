// Create a new React component here!import React from 'react';
import React from 'react';
import Tags from './Tags.jsx'
import { Link } from 'react-router-dom';

import view_icon from 'images/view-icon.png'
import like_icon from 'images/heart-icon.png'
import repost_icon from 'images/repost-icon.png'
import comment_icon from 'images/comment-icon.png'
import plus_icon from 'images/plus-icon.svg'

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      polaroid_height: 0,
      views: this.props.views,
      likes: this.props.likes,
      reposts: this.props.reposts,
      comments: this.props.comments
    };

    this.handleLike = this.handleLike.bind(this);
    this.handleRepost = this.handleRepost.bind(this);
  }

    // componentDidMount() {
    //   const height = this.divElement.clientHeight;
    //   console.log("height is", height);
    //   this.setState({polaroid_height: height});
    // }
  handleLike(e) {
    console.log(this.props.id);
    fetch('/api/like', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        postId: this.props.id,
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
    console.log(this.props.id);
    fetch('/api/repost', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        postId: this.props.id,
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

  render() {
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
              <p id="post_status">posted a fit 2 hours ago</p>
              <button id="genre_button">
                  <p id="genre_text">{this.props.genre}</p>
              </button>
            </div>
          </div>
          <Link to={{ pathname: '/' + this.props.user.username + '/' + this.props.id, state: { post_data: this.props} }}>
          <div id="image_wrapper">
            <img id="post_image" alt="" src={this.props.post_image_src}></img>
          </div>
        </Link>
          <div id="stats_header">
            <button id="views" className="stats_button">
              <img id="views_icon" alt="view icon" className="stats_icon" src={view_icon}></img>
              <p className="stats_number" id="view_number">{this.state.views}</p>
            </button>
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
            <p className="stats_number" id="comment_number">{this.state.comments}</p>
          </button>
          <div id="playlist_dropdown" className="dropdown">
            <button id="add_to_playlist" className="dropdown-toggle" type="button" data-toggle="dropdown">
              <img id="add_to_playlist_icon" alt="add icon" className="stats_icon" src={plus_icon}></img>
            </button>
            <ul className="dropdown-menu">
              <li><a>Create New Playlist</a></li>
              <li>Playlist 1</li>
              <li><a>Playlist 2</a></li>
            </ul>
          </div>
        </div>
      </div>
          <div id="tags_div_wrapper">
            <div id="title">
              <p id="title_text">{this.props.title}</p>
            </div>
            <hr id="tag_title_hr"></hr>
            <Tags tags={this.props.tags}/>
            <hr id="tag_title_hr"></hr>
            <div id="description_wrapper">
            <p id="description">{this.props.description}</p>
            </div>
        </div>
        <hr id="post_hr"></hr>
      </div>
    );
  }
}
