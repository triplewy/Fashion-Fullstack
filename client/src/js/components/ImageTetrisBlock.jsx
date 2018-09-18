import React from 'react';
import ProfileHover from './ProfileHover.jsx'
import CarouselImages from './CarouselImages.jsx'
import StatsHeader from './StatsHeader.jsx'
import { setAspectRatioImageTetrisBlock } from './aspectRatio.js'
import { Link } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'
import Cookie from 'js-cookie'

export default class ImageTetris extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entered: false,
      carouselIndex: 0,
      bottom: 0,
      seen: 0
    };

    this.setEntered = this.setEntered.bind(this)
    this.setLeft = this.setLeft.bind(this)
    this.setCarouselIndex = this.setCarouselIndex.bind(this)
    this.myRef = React.createRef()
    this.handleScroll = this.handleScroll.bind(this)
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
      var view = {mediaId: this.props.mediaId, explore:true, dateTime: nowISOString}
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

  setCarouselIndex(index) {
    this.setState({carouselIndex: index})
  }

  render() {
    const post = this.props.post
    const postImages = JSON.parse(post.images)
    const [width, height] = setAspectRatioImageTetrisBlock(postImages[0].width, postImages[0].height)
    return (
      <div className="tetris_block_wrapper" onMouseEnter={this.setEntered} onMouseLeave={this.setLeft} ref={this.myRef}>
        {postImages.length > 1 ?
          <LinkContainer to={"/" + post.username + "/" + post.url}>
            <CarouselImages imageUrls={postImages} carouselIndex={this.state.carouselIndex} setCarouselIndex={this.setCarouselIndex} explore={true}/>
          </LinkContainer>
        :
          <Link to={"/" + post.username + "/" + post.url}>
            <div className="tetris_image" style={{backgroundImage: 'url(' + postImages[0].imageUrl + ')',
              width: width, height: height, backgroundSize: width + "px " + height + "px"}} />
          </Link>
        }
        <div className="block_profile" style={{opacity: this.state.entered ? 1 : 0}}>
          <ProfileHover classStyle="post_profile_link" username={post.username} profileName={post.profileName}
            profile_image_src={post.profile_image_src} />
        </div>
        <div className="block_stats" style={{opacity: this.state.entered ? 1 : 0}}>
          <StatsHeader mediaId={post.mediaId} views={post.views} likes={post.likes} reposts={post.reposts}
            reposted={post.reposted} liked={post.liked} isPoster={post.isPoster}/>
        </div>
      </div>
    );
  }
}
