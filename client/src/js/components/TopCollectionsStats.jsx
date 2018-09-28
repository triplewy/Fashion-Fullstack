import React from 'react';
import AlbumTetrisBlock from './AlbumTetrisBlock.jsx'
import ProfileHover from './ProfileHover.jsx'
import { Link } from 'react-router-dom';

export default class TopCollectionsStats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      topCollections: [],
      topViewers: []
    };

    this.fetchTopPlaylists = this.fetchTopPlaylists.bind(this)
    this.fetchTopPlaylistsViewers = this.fetchTopPlaylistsViewers.bind(this)
  }

  componentDidMount() {
    this.fetchTopPlaylists()
    this.fetchTopPlaylistsViewers()
  }

  componentDidUpdate(prevProps) {
    if (this.props.timePeriod !== prevProps.timePeriod) {
      this.fetchTopPlaylists()
      this.fetchTopPlaylistsViewers()
    }
  }

  fetchTopPlaylists() {
    fetch('/api/topPlaylists/' + this.props.timePeriod, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        console.log(data);
        this.setState({topCollections: data})
      }
    })
    .catch(e => {
      console.log(e);
    })
  }

  fetchTopPlaylistsViewers() {
    fetch('/api/topPlaylistsViewers/' + this.props.timePeriod, {
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
    var renderedTopPlaylists = [];
    if (this.state.topCollections.length > 0) {
      renderedTopPlaylists = this.state.topCollections.map((item, index) => {
        return (
          <div key={index} className="top_posts_column">
            <AlbumTetrisBlock playlist={item} explore />
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
        <p className="stats_title">Top Viewed Collections</p>
        <div className="top_posts_wrapper">
          {renderedTopPlaylists}
        </div>
        <p className="stats_title">Top Viewers</p>
        <div className="top_posts_wrapper">
          {renderedTopviewers}
        </div>
      </div>
    );
  }
}
