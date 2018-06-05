import React from 'react';
// import posts from '../json/posts.json';
import { Link } from 'react-router-dom';

import view_icon from 'images/view-icon.png'
import like_icon from 'images/heart-icon.png'
import repost_icon from 'images/repost-icon.png'
import comment_icon from 'images/comment-icon.png'

// var data = posts.posts;

export default class ViewsGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };

  }

  render() {
      return (
        <div id="views_graph_div">
          <div className="stats_portion_div">
            <p className="stats_title">Stats</p>
              <img id="views_icon" alt="view icon" className="stats_icon" src={view_icon}></img>
              <p className="views_graph_stats_number" id="view_number">2333</p>
              <img id="like_icon" alt="like icon" className="stats_icon" src={like_icon}></img>
              <p className="views_graph_stats_number" id="like_number">53</p>
              <img id="repost_icon" alt="repost icon" className="stats_icon" src={repost_icon}></img>
              <p className="views_graph_stats_number" id="repost_number">23</p>
              <img id="comment_icon" alt="comment icon" className="stats_icon" src={comment_icon}></img>
              <p className="views_graph_stats_number" id="comment_number">15</p>
              <div id="graph_wrapper">

              </div>
            </div>
            <div className="stats_portion_div">
              <p className="stats_title">Top Viewed Posts</p>
              <Link to={"/profile/3"}>
                <div id="stats_polaroid_div">
                  <div id="post_header">
                    <div id="charts_title">
                      <p id="title_text">Jennifer Bin in Some Vapors</p>
                    </div>
                  </div>
                    <div id="image_wrapper">
                      <img id="post_image" alt="" src="../images/jbin-1.jpg"></img>
                    </div>
                </div>
            </Link>
            <div className="stats_bar_container">
              <div className="view_bar">10,864 views</div>
            </div>
            <Link to={"/profile/3"}>
              <div id="stats_polaroid_div">
                <div id="post_header">
                  <div id="charts_title">
                    <p id="title_text">Jennifer Bin in Some Vapors</p>
                  </div>
                </div>
                  <div id="image_wrapper">
                    <img id="post_image" alt="" src="../images/jbin-1.jpg"></img>
                  </div>
              </div>
          </Link>
          <div className="stats_bar_container">
            <div className="view_bar">10,864 views</div>
          </div>
          <Link to={"/profile/3"}>
            <div id="stats_polaroid_div">
              <div id="post_header">
                <div id="charts_title">
                  <p id="title_text">Jennifer Bin in Some Vapors</p>
                </div>
              </div>
                <div id="image_wrapper">
                  <img id="post_image" alt="" src="../images/jbin-1.jpg"></img>
                </div>
            </div>
        </Link>
        <div className="stats_bar_container">
          <div className="view_bar">10,864 views</div>
        </div>
        </div>
        <div className="stats_portion_div">
            <p className="stats_title">Top Viewers</p>
            <div className="top_viewer_div" id="left_top_viewer_div">
              <img id="top_viewer_profile_image" alt="" src="../images/jbin-profile.jpg"></img>
              <div id="profile_info_text_div">
                <strong className="profile_info_text">Jennifer Bin</strong>
                <p className="profile_info_text">Shanghai, China</p>
                <div className="view_bar" id="top_viewer_view_bar">10,993 views</div>
              </div>
            </div>
            <div className="top_viewer_div" id="center_top_viewer_div">
              <img id="top_viewer_profile_image" alt="" src="../images/jbin-profile.jpg"></img>
              <div id="profile_info_text_div">
                <strong className="profile_info_text">Jennifer Bin</strong>
                <p className="profile_info_text">Shanghai, China</p>
                <div className="view_bar" id="top_viewer_view_bar">10,993 views</div>
              </div>
            </div>
            <div className="top_viewer_div" id="right_top_viewer_div">
              <img id="top_viewer_profile_image" alt="" src="../images/jbin-profile.jpg"></img>
              <div id="profile_info_text_div">
                <strong className="profile_info_text">Jennifer Bin</strong>
                <p className="profile_info_text">Shanghai, China</p>
                <div className="view_bar" id="top_viewer_view_bar">10,993 views</div>
              </div>
            </div>
          </div>
          <div className="stats_portion_div">
            <p className="stats_title">Top Locations</p>
              <strong className="top_locations_title">Cities:</strong>
              <div className="top_viewer_div" id="left_top_viewer_div">
                <img className="country_icon" alt="country icon" src="../images/Australia.svg"></img>
                <div id="profile_info_text_div">
                  <p className="profile_info_text">Shanghai, China</p>
                  <div className="view_bar" id="top_viewer_view_bar">10,993 views</div>
                </div>
              </div>
              <div className="top_viewer_div" id="center_top_viewer_div">
                <img className="country_icon" alt="country icon" src="../images/Australia.svg"></img>
                <div id="profile_info_text_div">
                  <p className="profile_info_text">Shanghai, China</p>
                  <div className="view_bar" id="top_viewer_view_bar">10,993 views</div>
                </div>
              </div>
              <div className="top_viewer_div" id="right_top_viewer_div">
                <img className="country_icon" alt="country icon" src="../images/Australia.svg"></img>
                <div id="profile_info_text_div">
                  <p className="profile_info_text">Shanghai, China</p>
                  <div className="view_bar" id="top_viewer_view_bar">10,993 views</div>
                </div>
              </div>
              <strong className="top_locations_title">Countries:</strong>
              <div className="top_viewer_div" id="left_top_viewer_div">
                <img className="country_icon" alt="country icon" src="../images/Australia.svg"></img>
                <div id="profile_info_text_div">
                  <p className="profile_info_text">China</p>
                  <div className="view_bar" id="top_viewer_view_bar">10,993 views</div>
                </div>
              </div>
              <div className="top_viewer_div" id="center_top_viewer_div">
                <img className="country_icon" alt="country icon" src="../images/Australia.svg"></img>
                <div id="profile_info_text_div">
                  <p className="profile_info_text">China</p>
                  <div className="view_bar" id="top_viewer_view_bar">10,993 views</div>
                </div>
              </div>
              <div className="top_viewer_div" id="right_top_viewer_div">
                <img className="country_icon" alt="country icon" src="../images/Australia.svg"></img>
                <div id="profile_info_text_div">
                  <p className="profile_info_text">China</p>
                  <div className="view_bar" id="top_viewer_view_bar">10,993 views</div>
                </div>
              </div>
            </div>

          </div>
      );
  }
}
