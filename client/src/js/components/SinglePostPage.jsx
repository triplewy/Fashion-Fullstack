import React from 'react';
import CarouselImages from './CarouselImages.jsx'
import Tags from './Tags.jsx'
import SinglePostPageComments from './SinglePostPageComments.jsx'
import RelatedPosts from './RelatedPosts.jsx'
import StatsHeader from './StatsHeader.jsx'
import ProfileHover from './ProfileHover.jsx'
import ErrorPage from './ErrorPage.jsx'
import { dateDiffInDays } from './DateHelper.js'
import { LinkContainer } from 'react-router-bootstrap'
import { Link } from 'react-router-dom';


export default class SinglePostPage extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props.location.state);
    if (this.props.location.state) {
      this.state = {
        // views: this.props.location.state.postData.views,
        // likes: this.props.location.state.postData.likes,
        // reposts: this.props.location.state.postData.reposts,
        // liked: this.props.location.state.postData.liked,
        // reposted: this.props.location.state.postData.reposted,
        tags: this.props.location.state.postData.tags,
        carouselIndex: 0,
        post: this.props.location.state.postData,
        relatedPosts: [],
        error: false
      };
    } else {
      this.state = {
        // views: null,
        // likes: null,
        // reposts: null,
        // liked: false,
        // reposted: false,
        tags: null,
        carouselIndex: 0,
        post: null,
        relatedPosts: [],
        error: false
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

  componentDidUpdate(prevProps) {
    if (this.props.match.url !== prevProps.match.url) {
      window.scrollTo(0,0)
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
      var post = this.state.post
      post.views = data.views
      post.likes = data.likes
      post.reposts = data.reposts
      post.liked = data.liked
      post.reposted = data.reposted
      this.setState({post: post})
      // this.setState({views: data.views, likes: data.likes, reposts: data.reposts, liked: data.liked, reposted: data.reposted});
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
        view: view
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        var post = this.state.post
        post.views += 1
        this.setState({post: post})
        // this.setState({views: this.state.views + 1})
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
      if (data.message === "error") {
        this.setState({error: true})
      } else {
        this.setState({post: data})
        this.postVisit(data.mediaId)
      }
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
                {post.original !== 0 && <span>✔</span>}
                <Link to={"/explore/" + post.genre}>{post.genre.replace(/^\w/, c => c.toUpperCase())}</Link>
                <p>{dateDiffInDays(new Date(post.uploadDate)) + " ago"}</p>
              </div>
            </div>
          </div>
          <div className="single_post_wrapper">
            <div className="center">
              <CarouselImages singlePost imageUrls={post.imageUrls} carouselIndex={this.state.carouselIndex} setCarouselIndex={this.setCarouselIndex}/>
              <StatsHeader post={post}/>
            </div>
          </div>
          <div className="single_post_bottom">
            <RelatedPosts url={this.props.match.url} />
            <div className="right_bottom">
              <Tags mediaId={post.mediaId} tags={this.state.tags} setCarouselIndex={this.setCarouselIndex} carouselIndex={this.state.carouselIndex}/>
              {post.description &&
                <div id="description_wrapper">
                  <p id="description">{post.description.split('\n').map((item, key) => {
                    return <span key={key}>{item}<br/></span>})}</p>
                </div>
              }
              <SinglePostPageComments mediaId={post.mediaId} username={this.props.match.params.profile}/>
            </div>
          </div>
        </div>
      );
    } else if (this.state.error) {
      return (
        <ErrorPage />
      )
    } else {
      return (
        <div id="white_background_wrapper">
          Loading
        </div>
      )
    }

  }
}
