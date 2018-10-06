import React from 'react';
import PlaylistModal from './PlaylistModal.jsx'
import MoreDropdown from './MoreDropdown.jsx'
import NotLoggedInOverlay from './NotLoggedInOverlay.jsx'
import view_icon_revised from 'images/view-icon-revised.png'
import like_icon from 'images/heart-icon.png'
import like_icon_hover from 'images/heart-icon-hover.png'
import like_icon_liked from 'images/heart-icon-liked.png'
import repost_icon from 'images/repost-icon.png'
import repost_icon_reposted from 'images/repost-icon-reposted.png'

const url = process.env.REACT_APP_API_URL

export default class StatsHeader extends React.Component {
  constructor(props) {
    super(props);

    const post = this.props.post
    if (post) {
      this.state = {
        likes: post.likes,
        reposts: post.reposts,
        liked: post.liked,
        reposted: post.reposted,

        showOverlay: false,
        target: null
      };
    } else {
      this.state = {
        likes: 0,
        reposts: 0,
        liked: false,
        reposted: false,

        showOverlay: false,
        target: null
      };
    }

    this.handleLike = this.handleLike.bind(this);
    this.handleUnlike = this.handleUnlike.bind(this);
    this.handleRepost = this.handleRepost.bind(this);
    this.handleUnrepost = this.handleUnrepost.bind(this);
    this.showOverlay = this.showOverlay.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (this.props.post !== prevProps.post) {
      const post = this.props.post
      this.setState({likes: post.likes, reposts: post.reposts, liked: post.liked, reposted: post.reposted})
    }
  }

  handleLike(e) {
    e.stopPropagation()
    const target = e.target
    fetch(url + '/api/like', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.post.mediaId,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({likes: this.state.likes + 1, liked: true})
      } else if (data.message === "not logged in") {
        console.log("yoooooooo");
        this.showOverlay(target)
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleUnlike(e) {
    e.stopPropagation()
    const target = e.target
    fetch(url + '/api/unlike', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.post.mediaId,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({likes: this.state.likes - 1, liked: false})
      } else if (data.message === "not logged in") {
        this.showOverlay(target)
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleRepost(e) {
    e.stopPropagation()
    const target = e.target
    fetch(url + '/api/repost', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.post.mediaId,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({reposts: this.state.reposts + 1, reposted: true})
      } else if (data.message === "not logged in") {
        this.showOverlay(target)
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleUnrepost(e) {
    e.stopPropagation()
    const target = e.target
    fetch(url + '/api/unrepost', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.post.mediaId,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({reposts: this.state.reposts - 1, reposted: false})
      } else if (data.message === "not logged in") {
        this.showOverlay(target)
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  showOverlay(target) {
    this.setState({showOverlay: true, target: target})
    setTimeout(function() {
      this.setState({showOverlay: false})
    }.bind(this), 2000)
  }

  render() {
    const post = this.props.post
    return (
      <div id="stats_header">
        <div id="views">
          <div style={{backgroundImage: 'url(' + view_icon_revised + ')'}}/>
          <p className="stats_number">{post.views}</p>
        </div>
        <button id="likes" onClick={this.state.liked ? this.handleUnlike : this.handleLike}>
          <div style={{backgroundImage: this.state.liked ? 'url(' + like_icon_liked + ')' : 'url(' + like_icon + ')'}}/>
          <p className="stats_number">{this.state.likes}</p>
        </button>
        <button id="reposts" onClick={this.state.reposted ? this.handleUnrepost : this.handleRepost} disabled={this.props.isPoster}>
          <div style={{backgroundImage: this.state.reposted ? 'url(' + repost_icon_reposted + ')' : 'url(' + repost_icon + ')'}}/>
          <p className="stats_number">{this.state.reposts}</p>
        </button>
        <NotLoggedInOverlay showOverlay={this.state.showOverlay} target={this.state.target} />
        <div id="non_stat_div">
          <PlaylistModal mediaId={post.mediaId} username={post.username} toggleLoginModal={this.props.toggleLoginModal}/>
          <MoreDropdown post={post} />
      </div>
    </div>
    );
  }
}
