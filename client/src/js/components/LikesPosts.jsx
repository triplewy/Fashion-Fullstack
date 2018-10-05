import React from 'react';
import ImageTetris from './ImageTetris.jsx'

const url = process.env.REACT_APP_API_URL

export default class LikesPosts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      posts: []
    };

    this.fetchPostsLikes = this.fetchPostsLikes.bind(this)
  }

  componentDidMount() {
    this.fetchPostsLikes()
  }

  fetchPostsLikes() {
    fetch(url + '/api/you/likes/posts', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({posts: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    return (
      <ImageTetris posts={this.state.posts} explore/>
    );
  }
}
