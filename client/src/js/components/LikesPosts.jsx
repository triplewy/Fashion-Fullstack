import React from 'react';
import ImageTetris from './ImageTetris.jsx'
import TypeSelector from './TypeSelector.jsx'
import { Redirect } from 'react-router-dom';

export default class LikesPosts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      posts: [],
      redirect: false
    };

    this.toggle_type = this.toggle_type.bind(this);
    this.fetchPostsLikes = this.fetchPostsLikes.bind(this)
  }

  componentDidMount() {
    this.fetchPostsLikes()
  }

  toggle_type(e) {
    if (e.target.name == 1) {
      this.setState({redirect: true})
    }
  }

  fetchPostsLikes() {
    fetch('/api/you/likes/posts', {
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
    if (this.state.redirect) {
      return (
        <Redirect to="/you/likes/albums" />
      )
    }
    return (
      <div id="white_background_wrapper">
        <p className="page_title">Likes</p>
        <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["Posts", "Albums"]}
        type_selector_value={0}/>
        <ImageTetris posts={this.state.posts} explore/>
    </div>
  );
  }
}
