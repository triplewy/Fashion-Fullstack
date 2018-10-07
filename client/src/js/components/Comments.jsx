import React from 'react';
import ProfileHover from './ProfileHover.jsx'
import NotLoggedInOverlay from './NotLoggedInOverlay.jsx'
import { Link } from 'react-router-dom';
import { dateDiffInDays } from './DateHelper.js'

const url = process.env.REACT_APP_API_URL

export default class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numComments: this.props.comments,
      comments: [],
      commentInput: '',
      loadComments: false,

      showOverlay: false,
      target: null
    };

    this.fetchComments = this.fetchComments.bind(this)
    this.fetchPlaylistComments = this.fetchPlaylistComments.bind(this)
    this.handleComment = this.handleComment.bind(this)
    this.handlePlaylistComment = this.handlePlaylistComment.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.setLoadComments = this.setLoadComments.bind(this)
    this.showOverlay = this.showOverlay.bind(this)
  }

  fetchComments(e) {
    fetch(url + '/api/' + this.props.username + '/' + this.props.mediaId + '/comments', {
      credentials: 'include'
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      this.setState({comments: data.comments, loadComments: true})
    })
    .catch((error) => {
      console.error(error);
    });
  }

  fetchPlaylistComments(e) {
    fetch(url + '/api/' + this.props.username + '/' + this.props.playlistId + '/playlistComments', {
      credentials: 'include'
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      this.setState({comments: data.comments, loadComments: true})
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleComment(e) {
    const target = e.target
    fetch(url + '/api/comment', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.mediaId,
        comment: this.state.commentInput
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({commentInput: '', numComments: this.state.numComments + 1})
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

  handlePlaylistComment(e) {
    const target = e.target
    fetch(url + '/api/playlistComment', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: this.props.playlistId,
        comment: this.state.commentInput
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({commentInput: '', numComments: this.state.numComments + 1})
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

  handleChange(e) {
    this.setState({commentInput: e.target.value})
  }

  setLoadComments(e) {
    if (!this.state.loadComments) {
      if (this.props.playlistId) {
        this.fetchPlaylistComments()
      } else {
        this.fetchComments()
      }
    } else {
      this.setState({loadComments: false})
    }
  }

  showOverlay(target) {
    this.setState({showOverlay: true, target: target})
    setTimeout(function() {
      this.setState({showOverlay: false})
    }.bind(this), 2000)
  }

  render() {
    var renderedComments = [];
    if (this.state.comments) {
      renderedComments = this.state.comments.map((item, index) => {
        return (
          <li key={index}>
            <ProfileHover
              classStyle="post_profile_link"
              username={item.username}
              profileName={item.profileName}
            />
            <p className="comment_time">{dateDiffInDays(new Date(item.dateTime)) + " ago"}</p>
            <p className="comment">{item.comment}</p>
          </li>
        )
      })
    }

    return (
      <div id="comments_wrapper">
        <div id="comments_toggle" onClick={this.setLoadComments}>
          <p>{this.state.numComments + " comments"}</p>
          <p id="comments_up_arrow">{this.state.loadComments ? "▼" : "▲"}</p>
        </div>
        {this.state.loadComments &&
          <ul className="comments_list">
            {renderedComments}
          </ul>
        }
        <div id="comments_input_bar">
          <input id="comments_input" type="text" value={this.state.commentInput}
            onChange={this.handleChange} placeholder="Comment"></input>
          <button id="comment_button" type="button" onClick={this.props.playlistId ? this.handlePlaylistComment: this.handleComment}>Send</button>
          <NotLoggedInOverlay showOverlay={this.state.showOverlay} target={this.state.target} />
        </div>
      </div>
    );
  }
}
