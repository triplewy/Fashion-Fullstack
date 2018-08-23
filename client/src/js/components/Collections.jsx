import React from 'react';
import { Link } from 'react-router-dom';
import StatsHeader from './StatsHeader.jsx'
import PlaylistStatsHeader from './PlaylistStatsHeader.jsx'
import TypeSelector from './TypeSelector.jsx'

export default class Collections extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      json_data: [],
      likes: [],
      rendered_posts: [],
      playlistsLikes: [],
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
      this.setState({likes: data.likes, json_data: data.likes});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  toggle_type(e) {
    if (e.target.name === 0) {
    } else if (e.target.name === 1) {
      fetch('/api/you/collections/playlistsLikes', {
        credentials: 'include'
      })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        this.setState({playlistsLikes: data.likes});
      })
      .catch((error) => {
        console.error(error);
      });
    } else {
    }
    this.setState({type_selector_value: e.target.name});
  }

  render() {
    var rendered_posts = [];
    if (this.state.json_data != null && this.state.type_selector_value === 0) {
      rendered_posts = this.state.json_data.map((item, index) => {
          return (
            <li id="polaroid_div" key={item.mediaId}>
                <Link to={"/" + item.username}>
                  <strong className="collection_item_title">{item.profileName}</strong>
                </Link>
                <Link to={{ pathname: '/' + item.username + '/' + item.mediaId, state: { post_data: item} }}>
                  <div>
                    <p className="collection_item_title">{item.title}</p>
                    <img className="collection_item_img" alt="collection item" src={item.post_image_src}></img>
                  </div>
                </Link>
                <StatsHeader mediaId={item.mediaId} is_collection={true} views={item.views}
                  likes={item.likes} reposts={item.reposts} liked={item.liked} reposted={item.reposted}/>
            </li>
          )
      });
    } else {
      rendered_posts = this.state.playlistsLikes.map((item, index) => {
          return (
            <li id="polaroid_div" key={item.playlistId}>
              <Link to={"/" + item.username}>
                <strong className="collection_item_title">{item.profileName}</strong>
              </Link>
              <Link to={{ pathname: '/' + item.username + '/playlist/' + item.mediaId, state: { post_data: item} }}>
                <p className="collection_item_title">{item.title}</p>
                <img className="collection_item_img" alt="collection item" src={item.imageUrl}></img>
              </Link>
              <PlaylistStatsHeader playlistId={item.playlistId} likes={item.likes} is_collection={true}
                reposts={item.reposts} followers={item.followers} liked={item.liked} reposted={item.reposted}/>
            </li>
          )
      });
    }
      return (
        <div id="white_background_wrapper">
          <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["Likes", "Playlists"]}
          type_selector_value={this.state.type_selector_value}/>
          <ul id="collections_list">
            {rendered_posts}
          </ul>
      </div>
  );
  }
}
