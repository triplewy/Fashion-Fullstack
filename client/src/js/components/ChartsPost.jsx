import React from 'react';
import Tags from './Tags.jsx'
import { Link } from 'react-router-dom';
import view_icon from 'images/view-icon.png'
import like_icon from 'images/heart-icon.png'
import repost_icon from 'images/repost-icon.png'
import comment_icon from 'images/comment-icon.png'
import plus_icon from 'images/plus-icon.svg'

export default class ChartsPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div id="charts_post_wrapper">
        <div id="charts_polaroid_div">
          <div id="post_header">
            <Link to={"/profile"}>
              <div id="profile_image_div">
                <img id="profile_image" alt="" src={this.props.profile_image_url}></img>
              </div>
                <strong id="user_name">{this.props.name}</strong>
          </Link>
          </div>
          <Link to={"/profile/"+ this.props.id}>
            <div id="image_wrapper">
              <img id="post_image" alt="" src={this.props.post_image_url}></img>
            </div>
          </Link>
          <div id="stats_header">
            <button id="views" className="stats_button">
              <img id="views_icon" alt="views icon" className="stats_icon" src={view_icon}></img>
              <p className="stats_number" id="view_number">{this.props.view_count}</p>
            </button>
            <button id="likes" className="stats_button">
              <img id="like_icon" alt="like icon" className="stats_icon" src={like_icon}></img>
              <p className="stats_number" id="like_number">{this.props.like_count}</p>
            </button>
            <button id="reposts" className="stats_button">
              <img id="repost_icon" alt="repost icon" className="stats_icon" src={repost_icon}></img>
              <p className="stats_number" id="repost_number">{this.props.repost_count}</p>
            </button>
          <button id="comments" className="stats_button">
            <img id="comment_icon" alt="comment_icon" className="stats_icon" src={comment_icon}></img>
            <p className="stats_number" id="comment_number">{this.props.comment_count}</p>
          </button>
          <button id="add_to_playlist" className="stats_button">
            <img id="add_to_playlist_icon" alt="add icon" className="stats_icon" src={plus_icon}></img>
          </button>
        </div>
        </div>
          <div id="charts_tags_div_wrapper">
            <div id="charts_title">
              <p id="title_text">{this.props.title}</p>
              <p id="charts_post_status">2 hours ago</p>
            </div>
            <hr id="charts_tag_title_hr"></hr>
            <Tags tags={this.props.tags}/>
            <hr id="charts_tag_title_hr"></hr>
        </div>
        <hr id="charts_post_hr"></hr>
      </div>
    );
  }
}
