import React from 'react';
import Tags from './Tags.jsx'
import RepostHeader from './RepostHeader.jsx'
import MediaHeader from './MediaHeader.jsx'
import PlaylistHeader from './PlaylistHeader.jsx'
import StatsHeader from './StatsHeader.jsx'
import PlaylistPosts from './PlaylistPosts.jsx'
import Comments from './Comments.jsx'
import PlaylistStatsHeader from './PlaylistStatsHeader.jsx'
import CarouselImages from './CarouselImages.jsx'
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap'
import Cookie from 'js-cookie'
import view_icon from 'images/view-icon-revised.png'


export default class Playlist extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      carouselIndex: 0,
      playlistIndex: 0,
      bottom: 0,
      tags: [],
      seen: new Array(this.props.playlist.posts.length).fill(false)
    };

    this.myRef = React.createRef()
    this.setPlaylistIndex = this.setPlaylistIndex.bind(this)
    this.fetchTags = this.fetchTags.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.setCarouselIndex = this.setCarouselIndex.bind(this)
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    setTimeout(() => {
      this.setState({bottom: this.myRef.current.offsetTop + this.myRef.current.clientHeight - 80})
    }, 10);
  }

  componentDidUpdate(prevProps) {
    if (this.props.playlist !== prevProps.playlist) {
      this.setState({carouselIndex: 0, playlistIndex: 0, bottom: this.myRef.current.offsetTop + this.myRef.current.clientHeight - 80, tags: [], seen: false})
      this.fetchTags(this.props.playlist.posts[0].mediaId)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll() {
    const playlist = this.props.playlist
    if (window.scrollY + window.innerHeight >= this.state.bottom && !this.state.seen[this.state.playlistIndex]) {
      var now = new Date()
      var nowISOString = now.toISOString()
      var view = {}
      var arr = []
      view = {playlistId: playlist.playlistId, mediaId: playlist.posts[this.state.playlistIndex].mediaId, repost_username: playlist.repost_username, dateTime: nowISOString}
      if (Cookie.get('collectionsViews')) {
        arr = JSON.parse(Cookie.get('collectionsViews'));
        arr.push(view)
        if (arr.length > 9) {
          Cookie.set('collectionsViews', [])
          fetch('/api/storeCollectionsViews', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              views: arr,
            })
          })
          .then(res => res.json())
          .then(data => {
            if (data.message === "success") {
              console.log("success");
            } else {
              console.log(data.message);
            }
          })
          .catch((error) => {
            console.error(error);
          });
        } else {
          Cookie.set('collectionsViews', arr)
        }
      } else {
        arr = [view]
        Cookie.set('collectionsViews', JSON.stringify(arr))
      }
      var tempSeen = this.state.seen
      tempSeen[this.state.playlistIndex] = true
      this.setState({seen: tempSeen})
    }
  }

  fetchTags(mediaId) {
    fetch('/api/postTags/' + mediaId, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      this.setState({tags: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  setPlaylistIndex(index, e) {
    this.setState({playlistIndex: index, carouselIndex: 0})
    this.fetchTags(this.props.playlist.posts[index].mediaId)
  }

  setCarouselIndex(index) {
    this.setState({carouselIndex: index})
  }

  render() {
    const playlist = this.props.playlist
    const currentPost = playlist.posts[this.state.playlistIndex]
    return (
      <div className="post_wrapper" ref={this.myRef}>
        <div id="polaroid_div">
          {playlist.repost_username ?
            <RepostHeader username={playlist.username} profileName={playlist.profileName} profile_image_src={playlist.profile_image_src}
              repost_username={playlist.repost_username} repost_profileName={playlist.repost_profileName} repost_profile_image_src={playlist.repost_profile_image_src}
              genre={playlist.genre} repostDate={playlist.repostDate} classStyle={"post_profile_link"}/>
            :
            <PlaylistHeader username={playlist.username} profileName={playlist.profileName} profile_image_src={playlist.profile_image_src}
              genre={playlist.genre} uploadDate={playlist.uploadDate} displayTime={playlist.displayTime} postsAdded={playlist.postsAdded}
              classStyle={"post_profile_link"}/>
          }
          <LinkContainer to={{ pathname: '/' + playlist.username + '/album/' + playlist.url, state: { playlistData: playlist} }}>
            <div className="image_wrapper">
              {currentPost &&
                <CarouselImages imageUrls={currentPost.imageUrls} carouselIndex={this.state.carouselIndex} setCarouselIndex={this.setCarouselIndex}/>
              }
            </div>
        </LinkContainer>
        <div id="stats_wrapper">
          <PlaylistStatsHeader playlistId={playlist.playlistId} likes={playlist.likes} reposts={playlist.reposts} followers={playlist.followers}
          reposted={playlist.reposted} liked={playlist.liked} followed={playlist.followed} isPoster={playlist.isPoster}/>
        </div>
        </div>
          <div id="tags_div_wrapper">
            <div id="tags_div_flexbox">
              <div id="title">
                <p id="title_text">{playlist.title}</p>
              </div>
              <Tags tags={this.state.tags}/>
              <div id="description_wrapper">
                <p id="description">{playlist.description}</p>
              </div>
              <PlaylistPosts playlistId={playlist.playlistId} repost_username={playlist.repost_username} posts={playlist.posts}
                playlistIndex={this.state.playlistIndex} setPlaylistIndex={this.setPlaylistIndex} />
              <Comments playlistId={playlist.playlistId} username={playlist.username} comments={playlist.comments} />
          </div>
        </div>
      </div>
    );
  }
}
