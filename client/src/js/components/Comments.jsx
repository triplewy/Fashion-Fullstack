import React from 'react';
import comment_icon from 'images/comment-icon.png'
import { Link } from 'react-router-dom';


export default class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: this.props.comments,
      commentInput: ''
    };

    this.handleComment = this.handleComment.bind(this);
    this.handleChange = this.handleChange.bind(this);
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
        this.setState({commentInput: ''})
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleChange(e) {
    console.log(this.state.commentInput);
    this.setState({commentInput: e.target.value})
  }

  render() {
    var renderedComments = [];
    if (this.state.comments != null) {
      renderedComments = this.state.comments.map((item, index) => {
        return (
          <li key={index}>
            <Link to={"/" + item.username}>
              <p id="comment_user">{item.profileName}</p>
            </Link>
            <p id="comment">{item.comment}</p>
            <p id="comment_time">1 hour ago</p>
          </li>
        )
      })
    }

    return (
      <div id="comments_wrapper">
        <div id="comments_input_bar">
          <input id="comments_input" type="text" value={this.state.commentInput}
            onChange={this.handleChange} placeholder="Comment"></input>
          <button id="comment_button" type="button" onClick={this.handleComment}>Send</button>
        </div>
        <div id="comments_div">
          <ul id="comments">
            {renderedComments}
          </ul>
        </div>
      </div>
    );
  }
}
