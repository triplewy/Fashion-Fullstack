import React from 'react';
import DropdownProfile from './DropdownProfile.jsx'
import { Link } from 'react-router-dom';
import { dateDiffInDays } from './DateHelper.js'

export default class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numComments: this.props.comments,
      comments: [],
      commentInput: '',
      loadComments: false
    };

    this.fetchComments = this.fetchComments.bind(this)
    this.fetchPlaylistComments = this.fetchPlaylistComments.bind(this)
    this.handleComment = this.handleComment.bind(this)
    this.handlePlaylistComment = this.handlePlaylistComment.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.setLoadComments = this.setLoadComments.bind(this)
  }

  fetchComments(e) {
    fetch('/api/' + this.props.username + '/' + this.props.mediaId + '/comments', {
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
    fetch('/api/' + this.props.username + '/' + this.props.playlistId + '/playlistComments', {
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
    fetch('/api/comment', {
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
        fetch('/api/' + this.props.username + '/' + this.props.mediaId + '/comments', {
          credentials: 'include'
        })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.comments);
          this.setState({commentInput: '', comments: data.comments, numComments: this.state.numComments + 1})
        })
        .catch((error) => {
          console.error(error);
        });
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handlePlaylistComment(e) {
    fetch('/api/playlistComment', {
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
        fetch('/api/' + this.props.username + '/' + this.props.playlistId + '/playlistComments', {
          credentials: 'include'
        })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.comments);
          this.setState({commentInput: '', comments: data.comments, numComments: this.state.numComments + 1})
        })
        .catch((error) => {
          console.error(error);
        });
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

  render() {
    var renderedComments = [];
    if (this.state.comments) {
      renderedComments = this.state.comments.map((item, index) => {
        return (
          <li key={index}>
            <div className="post_profile_link">
              <Link to={"/" + item.username}>
                <p className="comment_user">{item.profileName}</p>
              </Link>
              <DropdownProfile username={item.username} isProfile={false} />
            </div>
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
        </div>
      </div>
    );
  }
}
