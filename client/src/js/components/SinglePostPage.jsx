import React from 'react';
import Navbar from './Navbar.jsx'
import Tags from './Tags.jsx'
import Comments from './Comments.jsx'
import StatsHeader from './StatsHeader.jsx'
import { Link } from 'react-router-dom';

export default class SinglePostPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      post: this.props.location.state.post_data,
      comments: this.props.location.state.post_data.comments
    };
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
              <StatsHeader mediaId={this.state.post.mediaId} views={this.state.post.views}
                likes={this.state.post.likes} reposts={this.state.post.reposts} liked={this.state.post.liked} reposted={this.state.post.reposted}/>
              <Tags tags={this.state.post.tags}/>
              <div id="description_wrapper">
                <p id="description">{this.props.description}</p>
              </div>
              {this.props.description && <hr id="tag_title_hr"></hr>}
              <Comments comments={this.state.comments} mediaId={this.state.post.mediaId} username={this.state.post.username}/>
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
