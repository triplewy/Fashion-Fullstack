import React from 'react';
import { Link } from 'react-router-dom';

export default class TopStats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      topMedia: {},
      topViewers: {},
      postOrPlaylist: this.props.postOrPlaylist
    };

    this.fetchTopPosts = this.fetchTopPosts.bind(this)
    this.fetchTopPostsViewers = this.fetchTopPostsViewers.bind(this)
    this.fetchTopPlaylists = this.fetchTopPlaylists.bind(this)
    this.fetchTopPlaylistsViewers = this.fetchTopPlaylistsViewers.bind(this)
  }

  componentDidMount() {
    this.fetchTopPosts()
    this.fetchTopPostsViewers()
  }

  componentDidUpdate(prevProps) {
    console.log("views graph did update");
    if (this.props.postOrPlaylist !== prevProps.postOrPlaylist) {
      this.setState({postOrPlaylist: this.props.postOrPlaylist})
      if (this.props.postOrPlaylist) {
        this.fetchTopPlaylists()
        this.fetchTopPlaylistsViewers()
      } else {
        this.fetchTopPosts()
        this.fetchTopPostsViewers()
      }
    }
  }

  fetchTopPosts() {
    fetch('/api/topPosts', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        console.log(data);
        this.setState({topMedia: data})
      }
    })
    .catch(e => {
      console.log(e);
    })
  }

  fetchTopPostsViewers() {
    fetch('/api/topPostsViewers', {
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

  fetchTopPlaylists() {
    fetch('/api/topPlaylists', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        console.log(data);
        this.setState({topMedia: data})
      }
    })
    .catch(e => {
      console.log(e);
    })
  }

  fetchTopPlaylistsViewers() {
    fetch('/api/topPlaylistsViewers', {
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
      return (
        <div>
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
        </div>
      );
  }
}
