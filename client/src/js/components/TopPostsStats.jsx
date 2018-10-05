import React from 'react';
import ImageTetrisBlock from './ImageTetrisBlock.jsx'
import ProfileHover from './ProfileHover.jsx'
import { Link } from 'react-router-dom';

const url = process.env.REACT_APP_API_URL

export default class TopPostsStats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      topPosts: [],
      topViewers: []
    };

    this.fetchTopPosts = this.fetchTopPosts.bind(this)
    this.fetchTopPostsViewers = this.fetchTopPostsViewers.bind(this)
  }

  componentDidMount() {
    this.fetchTopPosts()
    this.fetchTopPostsViewers()
  }

  componentDidUpdate(prevProps) {
    if (this.props.timePeriod !== prevProps.timePeriod) {
      this.fetchTopPosts()
      this.fetchTopPostsViewers()
    }
  }

  fetchTopPosts() {
    fetch(url + '/api/topPosts/' + this.props.timePeriod, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        console.log(data);
        this.setState({topPosts: data})
      }
    })
    .catch(e => {
      console.log(e);
    })
  }

  fetchTopPostsViewers() {
    fetch(url + '/api/topPostsViewers/' + this.props.timePeriod, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        console.log(data);
        this.setState({topViewers: data})
      }
    })
    .catch(e => {
      console.log(e);
    })
  }

  render() {
    var renderedTopPosts = [];
    if (this.state.topPosts.length > 0) {
      renderedTopPosts = this.state.topPosts.map((item, index) => {
        return (
          <div key={index} className="top_posts_column">
            <ImageTetrisBlock post={item} explore />
            <p>{item.timeViews}</p>
          </div>
        )
      })
    }

    var renderedTopviewers = [];
    if (this.state.topViewers.length > 0) {
      renderedTopviewers = this.state.topViewers.map((item, index) => {
        return (
          <div key={index} className="top_viewers_column" style={{display: 'inline-flex'}}>
            <div>
              <ProfileHover key={index} classStyle="followers_profile" username={item.username} profileName={item.profileName}
                profile_image_src={item.profile_image_src} />
              <p className="time_views">{item.timeViews}</p>
            </div>
          </div>
        )
      })
    }

    return (
      <div>
        <p className="stats_title">Top Viewed Posts</p>
        <div className="top_posts_wrapper">
          {renderedTopPosts}
        </div>
        <p className="stats_title">Top Viewers</p>
        <div className="top_posts_wrapper">
          {renderedTopviewers}
        </div>
      </div>
    );
  }
}
