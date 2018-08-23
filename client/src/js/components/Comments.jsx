import React from 'react';
import DropdownProfile from './DropdownProfile.jsx'
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

  // componentDidMount() {
  //   if (!this.props.comments) {
  //     fetch('/api/' + this.props.username + '/' + this.props.mediaId + '/comments', {
  //       credentials: 'include'
  //     })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data);
  //       this.setState({comments: data.comments})
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  //   }
  // }

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
      if (data.message == "success") {
        fetch('/api/' + this.props.username + '/' + this.props.mediaId + '/comments', {
          credentials: 'include'
        })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.comments);
          this.setState({commentInput: '', comments: data.comments})
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
      renderedComments = JSON.parse(this.state.comments).map((item, index) => {
        return (
          <li key={index}>
            <div className="post_profile_link">
              <Link to={"/" + item.username}>
                <p className="comment_user">{item.profileName}</p>
              </Link>
              <DropdownProfile username={item.username} location={item.location}
                userFollowers={item.userFollowers} userFollowed={item.userFollowed} />
            </div>
            <p className="comment">{item.comment}</p>
            <p className="comment_time">1 hour ago</p>
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
