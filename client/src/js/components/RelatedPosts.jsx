import React from 'react';
import ImageTetrisBlock from './ImageTetrisBlock.jsx'

const url = process.env.REACT_APP_API_URL

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
    fetch(url + '/api/relatedPosts' + this.props.url, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      this.setState({relatedPosts: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    const relatedPosts = this.state.relatedPosts
    if (relatedPosts.length > 0) {
      var renderedCol1 = []
      var renderedCol2 = []
      var renderedPosts = [];
      for (var i = 0; i < relatedPosts.length; i++) {
        if (i%2) {
          renderedCol2.push([<ImageTetrisBlock key={i} post={relatedPosts[i]} relatedPosts />])
        } else {
          renderedCol1.push([<ImageTetrisBlock key={i} post={relatedPosts[i]} relatedPosts />])
        }
      }
      return (
        <div className="left_bottom">
          <p>Related Posts</p>
          <div className="related_tetris_column">
            {renderedCol1}
          </div>
          <div className="related_tetris_column">
            {renderedCol2}
          </div>
        </div>
      )
    } else {
      return (
        null
      )
    }
  }
}
