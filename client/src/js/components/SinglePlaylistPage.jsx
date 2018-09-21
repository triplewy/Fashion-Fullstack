import React from 'react';
import CarouselImages from './CarouselImages.jsx'
import Tags from './Tags.jsx'
import SinglePostPageComments from './SinglePostPageComments.jsx'
import PlaylistPosts from './PlaylistPosts.jsx'
import PlaylistStatsHeader from './PlaylistStatsHeader.jsx'
import ProfileHover from './ProfileHover.jsx'
import { dateDiffInDays } from './DateHelper.js'
import { LinkContainer } from 'react-router-bootstrap'
import { Link } from 'react-router-dom';

export default class SinglePlaylistPage extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    if (this.props.location.state) {
      this.state = {
        followers: this.props.location.state.playlistData.followers,
        likes: this.props.location.state.playlistData.likes,
        reposts: this.props.location.state.playlistData.reposts,
        followed: this.props.location.state.playlistData.followed,
        liked: this.props.location.state.playlistData.liked,
        reposted: this.props.location.state.playlistData.reposted,
        tags: [],
        playlistIndex: 0,
        carouselIndex: 0,
        playlist: this.props.location.state.playlistData
      };
    } else {
      this.state = {
        followers: null,
        likes: null,
        reposts: null,
        followed: false,
        liked: false,
        reposted: false,
        tags: [],
        playlistIndex: 0,
        carouselIndex: 0,
        playlist: null
      };
    }

    this.fetchStats = this.fetchStats.bind(this)
    this.postVisit = this.postVisit.bind(this)
    this.fetchPlaylist = this.fetchPlaylist.bind(this)
    this.setPlaylistIndex = this.setPlaylistIndex.bind(this)
    this.setCarouselIndex = this.setCarouselIndex.bind(this)
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    if (this.state.playlist) {
      this.fetchStats(this.state.playlist.playlistId)
      this.postVisit(this.state.playlist.mediaId)
    } else {
      this.fetchPlaylist()
    }
  }

  setPlaylistIndex(index, e) {
    this.setState({playlistIndex: index, carouselIndex: 0})
  }

  setCarouselIndex(index) {
    this.setState({carouselIndex: index})
  }

  fetchStats(mediaId) {
    fetch('/api/postStats/' + mediaId, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      this.setState({views: data.views, likes: data.likes, reposts: data.reposts, liked: data.liked, reposted: data.reposted});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  postVisit(mediaId) {
    const now = new Date()
    const nowISOString = now.toISOString()
    const view = {mediaId: mediaId, dateTime: nowISOString}
    fetch('/api/postVisit', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        view: view,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({views: this.state.views + 1})
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  fetchPlaylist() {
    fetch('/api/playlist/' + this.props.match.url, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({playlist: data, views: data.views, likes: data.likes, reposts: data.reposts, liked: data.liked, reposted: data.reposted})
      this.postVisit(data.mediaId)
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    const playlist = this.state.playlist
    if (playlist) {
      return (
        <div id="white_background_wrapper">
          <div className="single_post_title_div">
            <ProfileHover classStyle="single_post_profile_link" username={playlist.username} profileName={playlist.profileName} profile_image_src={playlist.profile_image_src} />
            <div className="title">
              <p>{playlist.title}</p>
            </div>
            <div className="right">
              <div>
                {playlist.genre &&
                  <Link to={"/explore/" + playlist.genre}>{playlist.genre.replace(/^\w/, c => c.toUpperCase())}</Link>
                }
                <p>{dateDiffInDays(new Date(playlist.uploadDate)) + " ago"}</p>
              </div>
            </div>
          </div>
          <div className="single_post_wrapper">
            <div className="center">
              <CarouselImages singlePost={true} imageUrls={playlist.posts[this.state.playlistIndex].imageUrls} carouselIndex={this.state.carouselIndex} setCarouselIndex={this.setCarouselIndex}/>
              <PlaylistStatsHeader playlistId={playlist.playlistId} followers={this.state.followers} likes={this.state.likes} reposts={this.state.reposts}
                followed={this.state.followed} liked={this.state.liked} reposted={this.state.reposted} isPoster={playlist.isPoster}/>
            </div>
          </div>
          <div className="single_post_bottom">
            <div className="left_bottom">
              <p>Related Outfits</p>
              <ul>

              </ul>
            </div>
            <div className="right_bottom">
              <Tags mediaId={playlist.posts[this.state.playlistIndex].mediaId} tags={this.state.tags} modify={false} setCarouselIndex={this.setCarouselIndex} carouselIndex={this.state.carouselIndex}/>
              <div id="description_wrapper">
                <p id="description">{playlist.description.split('\n').map((item, key) => {
                  return <span key={key}>{item}<br/></span>})}</p>
              </div>
              <PlaylistPosts posts={playlist.posts} playlistIndex={this.state.playlistIndex} setPlaylistIndex={this.setPlaylistIndex} />
              <SinglePostPageComments playlistId={playlist.playlistId} username={this.props.match.params.profile}/>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div id="white_background_wrapper">
          Loading
        </div>
      )
    }

  }
}
