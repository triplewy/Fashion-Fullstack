import React from 'react';
import followers_icon from 'images/followers-icon-followed.png'
import like_icon from 'images/heart-icon-liked.png'
import repost_icon from 'images/repost-icon-reposted.png'
import comment_icon from 'images/comment-icon.png'

export default class TotalCollectionsStats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stats: {},
      views: {}
    };

    this.fetchPlaylistsStats = this.fetchPlaylistsStats.bind(this)
    this.fetchPlaylistsViews = this.fetchPlaylistsViews.bind(this)
  }

  componentDidMount() {
    this.fetchPlaylistsStats()
    this.fetchPlaylistsViews()
  }

  componentDidUpdate(prevProps) {
    if (this.props.timePeriod !== prevProps.timePeriod) {
      this.fetchPlaylistsStats()
      this.fetchPlaylistsViews()
    }
  }

  fetchPlaylistsStats() {
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

  fetchPlaylistsViews() {
    fetch('/api/playlistsViews/' + this.props.timePeriod, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        this.setState({views: data})
      }
    })
    .catch(e => {
      console.log(e);
    })
  }


  render() {
    const stats = this.state.stats
    const views = this.state.views
    if (stats && views) {
      const totalViews = views.collectionsViews
      return (
        <div id="views_graph_div">
          <div className="total_stats_div">
            <div>
              <p>{stats.followers}</p>
              <div className="stats_icon" style={{backgroundImage: 'url(' + followers_icon + ')'}} />
            </div>
            <div>
              <p>{stats.likes}</p>
              <div className="stats_icon" style={{backgroundImage: 'url(' + like_icon + ')'}} />
            </div>
            <div>
              <p>{stats.reposts}</p>
              <div className="stats_icon" style={{backgroundImage: 'url(' + repost_icon + ')'}} />
            </div>
            <div>
              <p>{stats.comments}</p>
              <div className="stats_icon" style={{backgroundImage: 'url(' + comment_icon + ')'}} />
            </div>
          </div>
          <div className="total_views">
            <p><span>{totalViews}</span>total views</p>
          </div>
          <div className="views_progress_bar_div">
            <div>
              <p>Views from collections:</p>
              <div className="views_progress_bar_wrapper">
                <div className="views_progress_bar" style={{width: (totalViews - views.collectionsRepostsViews) / totalViews * 100 + '%'}}>
                  <p>{Math.round((totalViews - views.collectionsRepostsViews) / totalViews * 100) + '%'}</p>
                </div>
                <p>{totalViews - views.collectionsRepostsViews}</p>
              </div>
            </div>
            <div>
              <p>Views from collection reposts:</p>
              <div className="views_progress_bar_wrapper">
                <div className="views_progress_bar"
                  style={{width: views.collectionsRepostsViews / totalViews * 100 + '%'}}>
                  <p>{Math.round(views.collectionsRepostsViews / totalViews * 100) + '%'}</p>
                </div>
                <p>{views.collectionsRepostsViews}</p>
              </div>
            </div>

          </div>
        </div>
      );
    } else {
      return (
        <div>Loading</div>
      )
    }

  }
}
