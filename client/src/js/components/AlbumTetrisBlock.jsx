import React from 'react';
import ProfileHover from './ProfileHover.jsx'
import PlaylistStatsHeader from './PlaylistStatsHeader.jsx'
import PlaylistPosts from './PlaylistPosts.jsx'
import CarouselImages from './CarouselImages.jsx'
import { setAspectRatioImageTetrisBlock } from './aspectRatio.js'
import Cookie from 'js-cookie'
import { LinkContainer } from 'react-router-bootstrap'

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
      this.setState({bottom: this.myRef.current.offsetTop + this.myRef.current.clientHeight - 80})
    }, 10);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll() {
    if (window.scrollY + window.innerHeight >= this.state.bottom && !this.state.seen) {
      var now = new Date()
      var nowISOString = now.toISOString()
      var view = {playlistId: this.props.playlist.playlistId, explore:true, dateTime: nowISOString}
      if (Cookie.get('viewHistory')) {
        var arr = JSON.parse(Cookie.get('viewHistory'));
        arr.push(view)
        if (arr.length > 9) {
          fetch('/api/storeViews', {
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
              Cookie.set('viewHistory', [])
            } else {
              console.log(data.message);
            }
          })
          .catch((error) => {
            console.error(error);
          });
        }
        Cookie.set('viewHistory', arr)
      } else {
        var newArr = [view]
        Cookie.set('viewHistory', JSON.stringify(newArr))
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
    const post = playlist.posts[this.state.playlistIndex]
    const postImages = post.imageUrls
    // var width = 0
    // var height = 0
    // if (this.props.relatedCollections) {
    //
    // } else {
    //   [width, height] = setAspectRatioImageTetrisBlock(postImages[0].width, postImages[0].height)
    // }

    return (
      <div className="album_tetris_block_wrapper" onMouseEnter={this.setEntered} onMouseLeave={this.setLeft} ref={this.myRef}>
        <LinkContainer to={{ pathname: '/' + playlist.username + '/album/' + playlist.url}}>
          <div className="image_wrapper">
            <CarouselImages imageUrls={postImages} carouselIndex={this.state.carouselIndex} setCarouselIndex={this.setCarouselIndex}
              explore={this.props.explore} relatedPosts={this.props.relatedCollections}/>
              <div className="block_profile" style={{opacity: this.state.entered ? 1 : 0}}>
                <ProfileHover classStyle="post_profile_link" username={playlist.username} profileName={playlist.profileName}
                  profile_image_src={playlist.profile_image_src} />
                  <p>{playlist.title}</p>
              </div>
              <div className="block_stats" style={{opacity: this.state.entered ? 1 : 0}}>
                <PlaylistStatsHeader playlistId={playlist.playlistId} followers={playlist.followers} likes={playlist.likes} reposts={playlist.reposts}
                  followed={playlist.followed} reposted={playlist.reposted} liked={playlist.liked} isPoster={playlist.isPoster}/>
              </div>
          </div>
        </LinkContainer>
        <PlaylistPosts playlistId={playlist.playlistId} posts={playlist.posts} setPlaylistIndex={this.setPlaylistIndex} playlistIndex={this.state.playlistIndex}/>
      </div>
    );
  }
}
