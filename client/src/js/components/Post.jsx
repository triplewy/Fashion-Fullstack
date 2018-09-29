import React from 'react';
import Tags from './Tags.jsx'
import RepostHeader from './RepostHeader.jsx'
import MediaHeader from './MediaHeader.jsx'
import StatsHeader from './StatsHeader.jsx'
import Comments from './Comments.jsx'
import CarouselImages from './CarouselImages.jsx'
import { Link } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'
import Cookie from 'js-cookie'

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      carouselIndex: 0,
      bottom: 0,
      seen: false
    };

    this.myRef = React.createRef()
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
    if (this.props.post !== prevProps.post) {
      this.setState({carouselIndex: 0, bottom: this.myRef.current.offsetTop + this.myRef.current.clientHeight - 80, seen: false})
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll() {
    const post = this.props.post
    if (window.scrollY + window.innerHeight >= this.state.bottom && !this.state.seen) {
      console.log("hit bottom");
      var now = new Date()
      var nowISOString = now.toISOString()
      var view = {}
      if (post.repost_username) {
        view = {mediaId: post.mediaId, reposter:post.repost_username, dateTime: nowISOString}
      } else {
        view = {mediaId: post.mediaId, dateTime: nowISOString}
      }
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

  setCarouselIndex(index) {
    this.setState({carouselIndex: index})
  }

  render() {
    const post = this.props.post
    return (
        <div className="post_wrapper" ref={this.myRef}>
          <div id="polaroid_div">
            {post.repost_username ?
              <RepostHeader username={post.username} profile_image_src={post.profile_image_src} profileName={post.profileName}
                repost_username={post.repost_username} repost_profileName={post.repost_profileName} repost_profile_image_src={post.repost_profile_image_src}
                genre={post.genre} repostDate={post.repostDate} isPlaylist={false} classStyle={"post_profile_link"}/>
              :
              <MediaHeader username={post.username} profile_image_src={post.profile_image_src} profileName={post.profileName}
                genre={post.genre} uploadDate={post.uploadDate} isPlaylist={false} classStyle={"post_profile_link"}/>
            }
          <LinkContainer to={{ pathname: '/' + post.username + '/' + post.url, state: { postData: post}}}>
            <div className="image_wrapper">
              <CarouselImages imageUrls={post.imageUrls} carouselIndex={this.state.carouselIndex} setCarouselIndex={this.setCarouselIndex}/>
            </div>
          </LinkContainer>
          <StatsHeader post={post}/>
        </div>
        <div id="tags_div_wrapper">
          <div id="tags_div_flexbox">
            <div id="title">
              <p id="title_text">{post.title}</p>
              <div className="title_og_tag">
                {post.original !== 0 && <span>✔</span>}
              </div>
              <div className="genre">
                {post.genre && <Link to={"/explore/" + post.genre}>{post.genre.replace(/^\w/, c => c.toUpperCase())}</Link>}
              </div>
            </div>
            <Tags mediaId={post.mediaId} tags={post.tags} modify={false} setCarouselIndex={this.setCarouselIndex} carouselIndex={this.state.carouselIndex}/>
            {post.description &&
            <div id="description_wrapper">
              <p id="description">{post.description.split('\n').map((item, key) => {
                return <span key={key}>{item}<br/></span>})}
              </p>
            </div>
            }
            <Comments mediaId={post.mediaId} username={post.username} comments={post.comments} />
          </div>
        </div>
      </div>
    );
  }
}
