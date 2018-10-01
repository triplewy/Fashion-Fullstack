import React from 'react';
import ProfileHover from './ProfileHover.jsx'
import CarouselImages from './CarouselImages.jsx'
import StatsHeader from './StatsHeader.jsx'
import { setAspectRatioImageTetrisBlock, setAspectRatioRelatedPosts } from './aspectRatio.js'
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
      var view = {mediaId: this.props.mediaId, explore:this.props.explore, dateTime: nowISOString}
      if (Cookie.get('postsViews')) {
        var arr = JSON.parse(Cookie.get('postsViews'));
        arr.push(view)
        if (arr.length > 9) {
          Cookie.set('postsViews', [])
          fetch('/api/storePostsViews', {
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
          Cookie.set('postsViews', arr)
        }
      } else {
        var newArr = [view]
        Cookie.set('postsViews', JSON.stringify(newArr))
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
    const postImages = this.props.post.imageUrls
    var width = 0;
    var height = 0;
    if (this.props.relatedPosts) {
      [width, height] = setAspectRatioRelatedPosts(postImages[0].width, postImages[0].height)
    } else {
      [width, height] = setAspectRatioImageTetrisBlock(postImages[0].width, postImages[0].height)
    }
    return (
      <div className="tetris_block_wrapper" onMouseEnter={this.setEntered} onMouseLeave={this.setLeft} ref={this.myRef}>
        {postImages.length > 1 ?
          <LinkContainer to={{ pathname: '/' + post.username + '/' + post.url, state: { postData: post}}}>
            <div className="image_wrapper">
              <CarouselImages imageUrls={postImages} carouselIndex={this.state.carouselIndex} setCarouselIndex={this.setCarouselIndex}
                explore={this.props.explore} relatedPosts={this.props.relatedPosts}/>
            </div>
          </LinkContainer>
        :
          <Link to={{ pathname: '/' + post.username + '/' + post.url, state: { postData: post}}}>
            <div className="tetris_image" style={{backgroundImage: 'url(' + postImages[0].imageUrl + ')',
              width: width, height: height, backgroundSize: width + "px " + height + "px"}} />
          </Link>
        }
        <div className="block_profile" style={{opacity: this.state.entered ? 1 : 0}}>
          <ProfileHover
            classStyle="post_profile_link"
            username={post.username}
            profileName={post.profileName}
            profile_image_src={post.profile_image_src}
            toggleLoginModal={this.props.toggleLoginModal}
          />
          <p>{post.title}</p>
        </div>
        <div className="block_stats" style={{opacity: this.state.entered ? 1 : 0}}>
          <StatsHeader post={post} toggleLoginModal={this.props.toggleLoginModal}/>
        </div>
      </div>
    );
  }
}
