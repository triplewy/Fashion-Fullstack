import React from 'react';
import PlaylistModal from './PlaylistModal.jsx'
import MoreDropdown from './MoreDropdown.jsx'
import view_icon_revised from 'images/view-icon-revised.png'
import like_icon from 'images/heart-icon.png'
import like_icon_hover from 'images/heart-icon-hover.png'
import like_icon_liked from 'images/heart-icon-liked.png'
import repost_icon from 'images/repost-icon.png'
import repost_icon_reposted from 'images/repost-icon-reposted.png'

export default class StatsHeader extends React.Component {
  constructor(props) {
    super(props);

    const post = this.props.post
    if (post) {
      this.state = {
        likes: post.likes,
        reposts: post.reposts,
        liked: post.liked,
        reposted: post.reposted
      };
    } else {
      this.state = {
        likes: 0,
        reposts: 0,
        liked: false,
        reposted: false
      };
    }

    this.handleLike = this.handleLike.bind(this);
    this.handleUnlike = this.handleUnlike.bind(this);
    this.handleRepost = this.handleRepost.bind(this);
    this.handleUnrepost = this.handleUnrepost.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.post !== prevProps.post) {
      const post = this.props.post
      this.setState({likes: post.likes, reposts: post.reposts, liked: post.liked, reposted: post.reposted})
    }
  }

  handleLike(e) {
    fetch('/api/like', {
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
        this.props.toggleLoginModal()
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleUnlike(e) {
    fetch('/api/unlike', {
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
        this.props.toggleLoginModal()
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleRepost(e) {
    fetch('/api/repost', {
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
        this.props.toggleLoginModal()
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleUnrepost(e) {
    fetch('/api/unrepost', {
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
        this.props.toggleLoginModal()
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    return (
      <div id="stats_header">
        <div id="views">
          <div style={{backgroundImage: 'url(' + view_icon_revised + ')'}}/>
          <p className="stats_number">{this.props.post.views}</p>
        </div>
        <button id="likes" onClick={this.state.liked ? this.handleUnlike : this.handleLike}>
          <div style={{backgroundImage: this.state.liked ? 'url(' + like_icon_liked + ')' : 'url(' + like_icon + ')'}}/>
          <p className="stats_number">{this.state.likes}</p>
        </button>
        <button id="reposts" onClick={this.state.reposted ? this.handleUnrepost : this.handleRepost} disabled={this.props.isPoster}>
          <div style={{backgroundImage: this.state.reposted ? 'url(' + repost_icon_reposted + ')' : 'url(' + repost_icon + ')'}}/>
          <p className="stats_number">{this.state.reposts}</p>
        </button>
        <div id="non_stat_div">
          <PlaylistModal mediaId={this.props.post.mediaId} toggleLoginModal={this.props.toggleLoginModal}/>
          <MoreDropdown post={this.props.post} />
      </div>
    </div>
    );
  }
}
