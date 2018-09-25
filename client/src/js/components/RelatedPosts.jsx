import React from 'react';
import ImageTetrisBlock from './ImageTetrisBlock.jsx'

export default class RelatedPosts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      relatedPosts: []
    }

    this.fetchRelatedPosts = this.fetchRelatedPosts.bind(this)
  }

  componentDidMount() {
    this.fetchRelatedPosts()
  }

  componentDidUpdate(prevProps) {
    if (this.props.url !== prevProps.url) {
      this.fetchRelatedPosts()
    }
  }

  fetchRelatedPosts() {
    fetch('/api/relatedPosts/' + this.props.url, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({relatedPosts: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    const relatedPosts = this.state.relatedPosts
    if (relatedPosts.length > 0) {
      var renderedPosts = [];
      renderedPosts = relatedPosts.map((item, index) => {
        return (
          <ImageTetrisBlock key={index} post={item} relatedPosts />
        )
      })
      return (
        <div className="left_bottom">
          <p>Related Posts</p>
          {renderedPosts}
        </div>
      )
    } else {
      return (
        null
      )
    }
  }
}
