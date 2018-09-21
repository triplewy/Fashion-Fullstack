import React from 'react';
import CarouselImages from './CarouselImages.jsx'
import Tags from './Tags.jsx'
import SinglePostPageComments from './SinglePostPageComments.jsx'
import StatsHeader from './StatsHeader.jsx'
import ProfileHover from './ProfileHover.jsx'
import { dateDiffInDays } from './DateHelper.js'
import { LinkContainer } from 'react-router-bootstrap'
import { Link } from 'react-router-dom';

export default class SinglePostPage extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.location.state) {
      this.state = {
        views: this.props.location.state.postData.views,
        likes: this.props.location.state.postData.likes,
        reposts: this.props.location.state.postData.reposts,
        liked: this.props.location.state.postData.liked,
        reposted: this.props.location.state.postData.reposted,
        tags: this.props.location.state.postData.tags,
        carouselIndex: 0,
        post: this.props.location.state.postData
      };
    } else {
      this.state = {
        views: null,
        likes: null,
        reposts: null,
        liked: false,
        reposted: false,
        tags: null,
        carouselIndex: 0,
        post: null
      };
    }


    this.fetchStats = this.fetchStats.bind(this)
    this.fetchTags = this.fetchTags.bind(this)
    this.postVisit = this.postVisit.bind(this)
    this.fetchPost = this.fetchPost.bind(this)
    this.setCarouselIndex = this.setCarouselIndex.bind(this)
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    if (this.state.post) {
      this.fetchStats(this.state.post.mediaId)
      this.postVisit(this.state.post.mediaId)
      if (!this.state.post.tags) {
        this.fetchTags(this.state.post.mediaId)
      }
    } else {
      this.fetchPost()
    }

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

  fetchPost() {
    fetch('/api/post/' + this.props.match.url, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({post: data, views: data.views, likes: data.likes, reposts: data.reposts, liked: data.liked, reposted: data.reposted})
      this.postVisit(data.mediaId)
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    const post = this.state.post
    if (post) {
      return (
        <div id="white_background_wrapper">
          <div className="single_post_title_div">
            <ProfileHover classStyle="single_post_profile_link" username={post.username} profileName={post.profileName} profile_image_src={post.profile_image_src} />
            <div className="title">
              <p>{post.title}</p>
            </div>
            <div className="right">
              <div>
                <Link to={"/explore/" + post.genre}>{post.genre.replace(/^\w/, c => c.toUpperCase())}</Link>
                <p>{dateDiffInDays(new Date(post.uploadDate)) + " ago"}</p>
              </div>
            </div>
          </div>
          <div className="single_post_wrapper">
            <div className="center">
              <CarouselImages singlePost={true} imageUrls={post.imageUrls} carouselIndex={this.state.carouselIndex} setCarouselIndex={this.setCarouselIndex}/>
              <StatsHeader mediaId={post.mediaId} views={this.state.views} likes={this.state.likes} reposts={this.state.reposts}
                liked={this.state.liked} reposted={this.state.reposted} isPoster={post.isPoster}/>
            </div>
          </div>
          <div className="single_post_bottom">
            <div className="left_bottom">
              <p>Related Outfits</p>
              <ul>

              </ul>
            </div>
            <div className="right_bottom">
              <Tags mediaId={post.mediaId} tags={this.state.tags} modify={false} setCarouselIndex={this.setCarouselIndex} carouselIndex={this.state.carouselIndex}/>
              <div id="description_wrapper">
                <p id="description">{post.description.split('\n').map((item, key) => {
                  return <span key={key}>{item}<br/></span>})}</p>
              </div>
              <SinglePostPageComments mediaId={post.mediaId} username={this.props.match.params.profile}/>
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
