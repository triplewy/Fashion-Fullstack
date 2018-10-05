import React from 'react';
import view_icon from 'images/view-icon.png'
import like_icon from 'images/heart-icon-liked.png'
import repost_icon from 'images/repost-icon-reposted.png'
import comment_icon from 'images/comment-icon.png'

const url = process.env.REACT_APP_API_URL

export default class TotalPostsStats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stats: {},
      views: {}
    };

    this.fetchPostsStats = this.fetchPostsStats.bind(this)
    this.fetchPostsViews = this.fetchPostsViews.bind(this)
  }

  componentDidMount() {
    this.fetchPostsStats()
    this.fetchPostsViews()
  }

  componentDidUpdate(prevProps) {
    if (this.props.timePeriod !== prevProps.timePeriod) {
      this.fetchPostsStats()
      this.fetchPostsViews()
    }
  }

  fetchPostsStats() {
    fetch(url + '/api/postsStats/' + this.props.timePeriod, {
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

  fetchPostsViews() {
    fetch(url + '/api/postsViews/' + this.props.timePeriod, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        console.log(data);
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
      const totalViews = views.postsViews + views.collectionsViews
      return (
        <div>
          <div className="total_stats_div">
            <div>
              <div className="stats_icon" style={{backgroundImage: 'url(' + like_icon + ')'}} />
              <p>{stats.likes}</p>
            </div>
            <div>
              <div className="stats_icon" style={{backgroundImage: 'url(' + repost_icon + ')'}} />
              <p>{stats.reposts}</p>
            </div>
            <div>
              <div className="stats_icon" style={{backgroundImage: 'url(' + comment_icon + ')'}} />
              <p>{stats.comments}</p>
            </div>
          </div>
          <div className="total_views">
            <p><span>{totalViews}</span>total views</p>
          </div>
          <div className="views_progress_bar_div">
            <div>
              <p>Views from posts:</p>
              <div className="views_progress_bar_wrapper">
                <div className="views_progress_bar"
                  style={{width: (views.postsViews - views.repostsViews) / totalViews * 100 + '%'}}>
                  <p>{Math.round((views.postsViews - views.repostsViews) / totalViews * 100) + '%'}</p>
                </div>
                <p>{views.postsViews - views.repostsViews}</p>
              </div>
            </div>
            <div>
              <p>Views from reposts:</p>
              <div className="views_progress_bar_wrapper">
                <div className="views_progress_bar" style={{width: views.repostsViews / totalViews * 100 + '%'}}>
                  <p>{Math.round(views.repostsViews / totalViews * 100) + '%'}</p>
                </div>
                <p>{views.repostsViews}</p>
              </div>
            </div>
            <div>
              <p>Views from collections:</p>
              <div className="views_progress_bar_wrapper">
                <div className="views_progress_bar" style={{width: (views.collectionsViews - views.collectionsRepostsViews) / totalViews * 100 + '%'}}>
                  <p>{Math.round((views.collectionsViews - views.collectionsRepostsViews) / totalViews * 100) + '%'}</p>
                </div>
                <p>{views.collectionsViews - views.collectionsRepostsViews}</p>
              </div>
            </div>
            <div>
              <p>Views from collections reposts:</p>
              <div className="views_progress_bar_wrapper">
                <div className="views_progress_bar" style={{width: views.collectionsRepostsViews / totalViews * 100 + '%'}}>
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
