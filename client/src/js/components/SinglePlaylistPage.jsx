import React from 'react';
import CarouselImages from './CarouselImages.jsx'
import Tags from './Tags.jsx'
import SinglePostPageComments from './SinglePostPageComments.jsx'
import RelatedCollections from './RelatedCollections.jsx'
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

  componentDidUpdate(prevProps) {
    if (this.props.playlist !== prevProps.playlist) {
      window.scrollTo(0,0)
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
    console.log('/api' + this.props.match.url);
    fetch('/api' + this.props.match.url, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({playlist: data, followers: data.followers, likes: data.likes, reposts: data.reposts, followed: data.followed, liked: data.liked, reposted: data.reposted})
      this.postVisit(data.posts[0].mediaId)
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    const playlist = this.state.playlist
    if (playlist) {
      const currentPost = playlist.posts[this.state.playlistIndex]
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
              <LinkContainer to={{ pathname: '/' + currentPost.username + '/' + currentPost.url}}>
                <div className="image_wrapper">
                  <CarouselImages singlePost={true} imageUrls={currentPost.imageUrls} carouselIndex={this.state.carouselIndex} setCarouselIndex={this.setCarouselIndex}/>
                </div>
              </LinkContainer>
              <PlaylistStatsHeader playlistId={playlist.playlistId} followers={this.state.followers} likes={this.state.likes} reposts={this.state.reposts}
                followed={this.state.followed} liked={this.state.liked} reposted={this.state.reposted} isPoster={playlist.isPoster}/>
            </div>
          </div>
          <div className="single_post_bottom">
            <RelatedCollections url={this.props.match.url} />
            <div className="right_bottom">
              <p>Playlist Info</p>
              <Tags mediaId={playlist.posts[this.state.playlistIndex].mediaId} tags={this.state.tags} modify={false} setCarouselIndex={this.setCarouselIndex} carouselIndex={this.state.carouselIndex}/>
              {playlist.description &&
                <div id="description_wrapper">
                  <p id="description">{playlist.description.split('\n').map((item, key) => {
                    return <span key={key}>{item}<br/></span>})}</p>
                </div>
              }
              <PlaylistPosts playlistId={playlist.playlistId} posts={playlist.posts} playlistIndex={this.state.playlistIndex} setPlaylistIndex={this.setPlaylistIndex} />
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
