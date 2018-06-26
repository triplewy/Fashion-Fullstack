import React from 'react';
import Navbar from './Navbar.jsx'
import { Link } from 'react-router-dom';
import StatsHeader from './StatsHeader.jsx'
import TypeSelector from './TypeSelector.jsx'

export default class Collections extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      json_data: [],
      post_data: [],
      rendered_posts: [],
      playlist_data: [],
      type_selector_value: 0
    };

    this.toggle_type = this.toggle_type.bind(this);

  }

  componentDidMount() {
    fetch('/api/you/collections/likes', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({post_data: data.likes, json_data: data.likes});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  toggle_type(e) {
    var data = this.state.json_data;
    var temp_data = [];
    if (e.target.name == 0) {
      temp_data = this.state.json_data
    } else if (e.target.name == 1) {
      temp_data = this.state.json_data
      fetch('/api/you/collections/playlists', {
        credentials: 'include'
      })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        this.setState({playlist_data: data.playlists});
      })
      .catch((error) => {
        console.error(error);
      });
    } else {
      temp_data = data;
    }
    this.setState({post_data: temp_data, type_selector_value: e.target.name});
  }

  render() {
    var rendered_posts = [];
    if (this.state.json_data != null && this.state.type_selector_value == 0) {
      rendered_posts = this.state.json_data.map((item, index) => {
          return (
            <li className="collection_item" key={item.mediaId}>
              <div className="collection_item_div">
                <Link to={"/" + item.user.username}>
                  <strong className="collection_item_title">{item.user.profileName}</strong>
                </Link>
                <Link to={{ pathname: '/' + item.user.username + '/' + item.mediaId, state: { post_data: item} }}>
                  <p className="collection_item_title">{item.title}</p>
                  <img className="collection_item_img" alt="collection item" src={item.post_image_src}></img>
                </Link>
                <StatsHeader is_collection={true} view_count={item.views}
                  like_count={item.likes} repost_count={item.reposts}
                  comment_count={item.comments}/>
              </div>
            </li>
          )
      });
    } else {
      rendered_posts = this.state.playlist_data.map((item, index) => {
          return (
            <li className="collection_item" key={item.mediaId}>
              <div className="collection_item_div">
                <Link to={"/" + item.user.username}>
                  <strong className="collection_item_title">{item.user.profileName}</strong>
                </Link>
                <Link to={{ pathname: '/' + item.user.username + '/playlist/' + item.mediaId, state: { post_data: item} }}>
                  <p className="collection_item_title">{item.title}</p>
                  <img className="collection_item_img" alt="collection item" src={item.playlist_cover_img_src}></img>
                </Link>
                <StatsHeader is_collection={true} like_count={item.likes}
                  repost_count={item.reposts} comment_count={item.comments}/>
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
