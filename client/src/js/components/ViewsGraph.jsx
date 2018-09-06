import React from 'react';
import { Link } from 'react-router-dom';

import view_icon from 'images/view-icon.png'
import like_icon from 'images/heart-icon.png'
import repost_icon from 'images/repost-icon.png'
import comment_icon from 'images/comment-icon.png'

export default class ViewsGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stats: {}
    };

    this.fetchPostsStats = this.fetchPostsStats.bind(this)
    this.fetchPlaylistssStats = this.fetchPlaylistssStats.bind(this)

  }

  componentDidMount() {
    this.fetchPostsStats()
  }

  componentDidUpdate(prevProps) {
    console.log("views graph did update");
    if (this.props.postOrPlaylist !== prevProps.postOrPlaylist) {
      if (this.props.postOrPlaylist) {
        this.fetchPlaylistssStats()
      } else {
        this.fetchPostsStats()
      }
    }

    if (this.props.timePeriod !== prevProps.timePeriod) {
      if (this.props.postOrPlaylist) {
        this.fetchPlaylistssStats()
      } else {
        this.fetchPostsStats()
      }
    }
  }

  fetchPostsStats() {
    fetch('/api/postsStats/' + this.props.timePeriod, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        console.log(data);
        this.setState({stats: data})
      }
    })
    .catch(e => {
      console.log(e);
    })
  }

  fetchPlaylistssStats() {
    fetch('/api/playlistsStats/' + this.props.timePeriod, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        this.setState({stats: data})
      }
    })
    .catch(e => {
      console.log(e);
    })
  }

  render() {
      return (
        <div id="views_graph_div">
          <div className="stats_portion_div">
            <p className="stats_title">{this.props.postOrPlaylist ? "Playlists" : "Posts"} Stats</p>
            <img id="views_icon" alt="view icon" className="stats_icon" src={view_icon}></img>
            <p className="views_graph_stats_number" id="view_number">{this.state.stats.views}</p>
            <img id="like_icon" alt="like icon" className="stats_icon" src={like_icon}></img>
            <p className="views_graph_stats_number" id="like_number">{this.state.stats.likes}</p>
            <img id="repost_icon" alt="repost icon" className="stats_icon" src={repost_icon}></img>
            <p className="views_graph_stats_number" id="repost_number">{this.state.stats.reposts}</p>
            <img id="comment_icon" alt="comment icon" className="stats_icon" src={comment_icon}></img>
            <p className="views_graph_stats_number" id="comment_number">{this.state.stats.comments}</p>
            <div id="graph_wrapper">

            </div>
            <p>Total views are: {this.state.stats.postsViews}</p>
            <p>Reposts views are: {this.state.stats.repostsViews}</p>
            <p>Playlists views are: {this.state.stats.playlistsViews}</p>
          </div>
        </div>
      );
  }
}
