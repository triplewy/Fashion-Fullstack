import React from 'react';
import view_icon from 'images/view-icon.png'
import like_icon from 'images/heart-icon.png'
import repost_icon from 'images/repost-icon.png'
import comment_icon from 'images/comment-icon.png'

export default class TotalCollectionsStats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stats: {}
    };

    this.fetchPlaylistssStats = this.fetchPlaylistssStats.bind(this)
  }

  componentDidMount() {
    this.fetchPlaylistssStats()
  }

  componentDidUpdate(prevProps) {
    if (this.props.timePeriod !== prevProps.timePeriod) {
      this.fetchPlaylistssStats()
    }
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
          <div className="total_stats_div">
            <div>
              <p>{this.state.stats.postsViews}</p>
              <div className="stats_icon" style={{backgroundImage: 'url(' + view_icon + ')'}} />
            </div>
            <div>
              <p>{this.state.stats.likes}</p>
              <div className="stats_icon" style={{backgroundImage: 'url(' + like_icon + ')'}} />
            </div>
            <div>
              <p>{this.state.stats.reposts}</p>
              <div className="stats_icon" style={{backgroundImage: 'url(' + repost_icon + ')'}} />
            </div>
            <div>
              <p>{this.state.stats.comments}</p>
              <div className="stats_icon" style={{backgroundImage: 'url(' + comment_icon + ')'}} />
            </div>
          </div>

          <p>Total views are: {this.state.stats.postsViews}</p>
          <p>Reposts views are: {this.state.stats.repostsViews}</p>
          <p>Playlists views are: {this.state.stats.playlistsViews}</p>
        </div>
      );
  }
}
