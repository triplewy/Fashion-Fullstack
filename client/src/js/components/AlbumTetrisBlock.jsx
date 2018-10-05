import React from 'react';
import ProfileHover from './ProfileHover.jsx'
import PlaylistStatsHeader from './PlaylistStatsHeader.jsx'
import PlaylistPosts from './PlaylistPosts.jsx'
import CarouselImages from './CarouselImages.jsx'
import { setAspectRatioImageTetrisBlock } from './aspectRatio.js'
import Cookie from 'js-cookie'
import { LinkContainer } from 'react-router-bootstrap'

const url = process.env.REACT_APP_API_URL

export default class AlbumTetrisBlock extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entered: false,
      playlistIndex: 0,
      carouselIndex: 0
    };

    this.setEntered = this.setEntered.bind(this)
    this.setLeft = this.setLeft.bind(this)
    this.myRef = React.createRef()
    this.handleScroll = this.handleScroll.bind(this)
    this.setPlaylistIndex = this.setPlaylistIndex.bind(this)
    this.setCarouselIndex = this.setCarouselIndex.bind(this)
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    setTimeout(() => {
      if (this.myRef.current) {
        this.setState({bottom: this.myRef.current.offsetTop + this.myRef.current.clientHeight - 80})
      }
    }, 10);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll() {
    if (window.scrollY + window.innerHeight >= this.state.bottom && !this.state.seen) {
      var now = new Date()
      var nowISOString = now.toISOString()
      const playlist = this.props.playlist
      var view = {playlistId: playlist.playlistId, mediaId: playlist.posts[this.state.playlistIndex].mediaId, explore:true, dateTime: nowISOString}
      if (Cookie.get('collectionsViews')) {
        var arr = JSON.parse(Cookie.get('collectionsViews'));
        arr.push(view)
        if (arr.length > 9) {
          Cookie.set('collectionsViews', [])
          fetch(url + '/api/storeCollectionsViews', {
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
        var newArr = [view]
        Cookie.set('collectionsViews', JSON.stringify(newArr))
      }
      this.setState({seen: true})
    }
  }

  setEntered(e) {
    if (!this.state.entered) {
      this.setState({entered: true})
    }
  }

  setLeft(e) {
    if (this.state.entered) {
      this.setState({entered: false})
    }
  }

  setPlaylistIndex(index) {
    this.setState({playlistIndex: index, carouselIndex: 0})
  }

  setCarouselIndex(index) {
    this.setState({carouselIndex: index})
  }

  render() {
    const playlist = this.props.playlist
    var posts = playlist.posts
    posts.sort(function(a, b) {
      return b.playlistIndex - a.playlistIndex;
    })
    const post = posts[this.state.playlistIndex]
    const postImages = post.imageUrls

    return (
      <div className="album_tetris_block_wrapper" onMouseEnter={this.setEntered} onMouseLeave={this.setLeft} ref={this.myRef}>
        <LinkContainer to={{ pathname: '/' + playlist.username + '/album/' + playlist.url}}>
          <div className="image_wrapper">
            <CarouselImages
              imageUrls={postImages}
              carouselIndex={this.state.carouselIndex}
              setCarouselIndex={this.setCarouselIndex}
              explore={this.props.explore}
              relatedPosts={this.props.relatedCollections}
            />
              <div className="block_profile" style={{opacity: this.state.entered ? 1 : 0}}>
                <ProfileHover
                  classStyle="post_profile_link"
                  username={playlist.username}
                  profileName={playlist.profileName}
                  profile_image_src={playlist.profile_image_src}
                />
                  <p>{playlist.title}</p>
              </div>
              <div className="block_stats" style={{opacity: this.state.entered ? 1 : 0}}>
                <PlaylistStatsHeader playlist={playlist}/>
              </div>
          </div>
        </LinkContainer>
        <PlaylistPosts
          explore
          playlistId={playlist.playlistId}
          posts={posts}
          setPlaylistIndex={this.setPlaylistIndex}
          playlistIndex={this.state.playlistIndex}/>
      </div>
    );
  }
}
