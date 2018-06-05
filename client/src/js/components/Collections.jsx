import React from 'react';
import Navbar from './Navbar.jsx'
import { Link } from 'react-router-dom';
import posts from '../json/posts.json';
import StatsHeader from './StatsHeader.jsx'
import TypeSelector from './TypeSelector.jsx'

var data = posts.posts;

export default class Collections extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      json_data: data,
      post_data: data,
      rendered_posts: [],
      type_selector_value: 0
    };

    this.toggle_type = this.toggle_type.bind(this);

  }

  toggle_type(e) {
    var temp_data = [];
    if (e.target.name == 0) {
      for (var i = 0; i < data.length; i++) {
        if(data[i].original) {
          temp_data.push(data[i]);
        }
      }
    } else if (e.target.name == 1) {
      for (i = 0; i < data.length; i++) {
        if(!data[i].original) {
          temp_data.push(data[i]);
        }
      }
    } else {
      temp_data = data;
    }
    this.setState({post_data: temp_data, type_selector_value: e.target.name});
  }

  render() {
    var rendered_posts = [];
    if (data != null && this.state.type_selector_value === 0) {
      rendered_posts = data.map((item, index) => {
          return (
            <li className="collection_item" key={item.id}>
              <div className="collection_item_div">
                <Link to={"/profile"}>
                  <strong className="collection_item_title">{item.user.name}</strong>
                </Link>
                <Link to={"/profile/"+index}>
                  <p className="collection_item_title">{item.title}</p>
                  <img className="collection_item_img" alt="collection item" src={item.img_src}></img>
                </Link>
                <StatsHeader is_collection={true} view_count={item.view_count}
                  like_count={item.like_count} repost_count={item.repost_count}
                  comment_count={item.comment_count}/>
              </div>
            </li>
          )
      });
    } else {
      rendered_posts = data.map((item, index) => {
          return (
            <li className="collection_item" key={item.id}>
              <div className="collection_item_div">
                <Link to={"/profile"}>
                  <strong className="collection_item_title">{item.user.name}</strong>
                </Link>
                <Link to={"/profile/playlists/playlist_1"}>
                  <p className="collection_item_title">Playlist_1</p>
                  <img className="collection_item_img" alt="collection item" src={item.img_src}></img>
                </Link>
              </div>
            </li>
          )
      });
    }
      return (
        <div>
        <Navbar />
        <div id="white_background_wrapper">
          <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["Likes", "Playlists"]}
          type_selector_value={this.state.type_selector_value}/>
          <ul id="collections_list">
            {rendered_posts}
          </ul>
        </div>
      </div>
  );
  }
}
