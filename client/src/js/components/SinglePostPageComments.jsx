import React from 'react';
import DropdownProfile from './DropdownProfile.jsx'
import { Link } from 'react-router-dom';
import { dateDiffInDays } from './DateHelper.js'

const url = process.env.REACT_APP_API_URL

export default class SinglePostPageComments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numComments: this.props.comments,
      comments: [],
      commentInput: ''
    };

    this.fetchComments = this.fetchComments.bind(this)
    this.fetchPlaylistComments = this.fetchPlaylistComments.bind(this)
    this.handleComment = this.handleComment.bind(this)
    this.handlePlaylistComment = this.handlePlaylistComment.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount() {
    if (this.props.playlistId) {
      this.fetchPlaylistComments()
    } else {
      this.fetchComments()
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.mediaId !== prevProps.mediaId) {
      this.fetchComments()
    } else if (this.props.playlistId !== prevProps.playlistId) {
      this.fetchPlaylistComments()
    }
  }

  fetchComments(e) {
    fetch(url + '/api/' + this.props.username + '/' + this.props.mediaId + '/comments', {
      credentials: 'include'
    })
    .then((response) => response.json())
    .then((data) => {
      this.setState({comments: data.comments})
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
      this.setState({comments: data.comments, loadComments: true})
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleComment(e) {
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
        fetch(url + '/api/' + this.props.username + '/' + this.props.mediaId + '/comments', {
          credentials: 'include'
        })
        .then((response) => response.json())
        .then((data) => {
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
        fetch(url + '/api/' + this.props.username + '/' + this.props.playlistId + '/playlistComments', {
          credentials: 'include'
        })
        .then((response) => response.json())
        .then((data) => {
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
        <div id="comments_input_bar">
          <input id="comments_input" type="text" value={this.state.commentInput}
            onChange={this.handleChange} placeholder="Comment"></input>
          <button id="comment_button" type="button" onClick={this.props.playlistId ? this.handlePlaylistComment: this.handleComment}>Send</button>
        </div>
        <ul className="comments_list">
          {renderedComments}
        </ul>
      </div>
    );
  }
}
