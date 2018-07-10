import React from 'react';
import Navbar from './Navbar.jsx'
import Tags from './Tags.jsx'
import Comments from './Comments.jsx'
import StatsHeader from './StatsHeader.jsx'
import { Link } from 'react-router-dom';
import view_icon from 'images/view-icon.png'
import like_icon from 'images/heart-icon.png'
import repost_icon from 'images/repost-icon.png'
import plus_icon from 'images/plus-icon.svg'
import more_icon from 'images/more-icon.png'

{/* <div id="single_post_stats_header">
  <button id="views" className="stats_button">
    <img id="views_icon" alt="views icon" className="stats_icon" src={view_icon}></img>
    <p className="stats_number" id="view_number">{this.state.post.views}</p>
  </button>
  <button id="likes" className="stats_button">
    <img id="like_icon" alt="likes icon" className="stats_icon" src={like_icon}></img>
    <p className="stats_number" id="like_number">{this.state.post.likes}</p>
  </button>
  <button id="reposts" className="stats_button">
    <img id="repost_icon" alt="reposts icon" className="stats_icon" src={repost_icon}></img>
    <p className="stats_number" id="repost_number">{this.state.post.reposts}</p>
  </button>
  <div id="non_stat_div">
    <button id="add_to_playlist">
      <img id="add_to_playlist_icon" alt="add icon" className="non_stat_icon" src={plus_icon}></img>
    </button>
    <button id="more">
      <img id="more_icon" alt="more icon" className="non_stat_icon" src={more_icon}></img>
    </button>
  </div>
</div> */}

export default class SinglePostPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      post: this.props.location.state.post_data
    };
  }

  componentDidMount() {
    fetch('/api/' + this.props.match.params.profile + '/' + this.props.match.params.postId)
    .then(res => res.json())
    .then(data => {
      console.log("post data is", data);
    });
  }

  render() {
    console.log(this.state.post);
      return (
        <div>
        <Navbar />
        <div id="white_background_wrapper">
          <div id="single_post_polaroid_div">
            <div id="single_post_image_wrapper">
                <img id="single_post_image" alt="" src={this.state.post.post_image_src}></img>
            </div>
          </div>
              <div id="single_post_tags_div_wrapper">
                <Link to={"/" + this.state.post.username}>
                <div id="single_post_profile_image_div">
                  <img id="profile_image" alt="" src={this.state.post.profile_image_src}></img>
                </div>
                <strong id="user_name">{this.state.post.profileName}</strong>
                </Link>
                <p id="single_post_status">2 hours ago</p>
                <div id="single_post_title_div">
                  <p id="single_post_title_text">{this.state.post.title}</p>
                  <button id="genre_button">{this.state.post.genre}</button>
                </div>
                <hr id="tag_title_hr"></hr>
                <Tags tags={this.state.post.tags}/>
                <hr id="tag_title_hr"></hr>
              <StatsHeader mediaId={this.state.post.mediaId} views={this.state.post.views}
                likes={this.state.post.likes} reposts={this.state.post.reposts} />
              <div id="description_wrapper">
              <p id="description">{this.state.post.description}</p>
              </div>
              <hr id="description_hr"></hr>
              <Comments comments={this.state.post.comments} />
              <hr id="description_hr"></hr>
              <div id="related_outfits_div">
                <p id="related_outfits_title">Related Outfits</p>
                <ul id="related_outfits_list">
                  <li className="likes_list_item">
                    <img className="likes_list_item_image" alt="related outfit" src="../images/tkd-paris.jpg"></img>
                  </li>
                  <li className="likes_list_item">
                    <img className="likes_list_item_image" alt="related outfit" src="../images/tkd-nyc.jpg"></img>
                  </li>
                  <li className="likes_list_item">
                    <img className="likes_list_item_image" alt="related outfit" src="../images/tkd.jpg"></img>
                    </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
  );
  }
}
