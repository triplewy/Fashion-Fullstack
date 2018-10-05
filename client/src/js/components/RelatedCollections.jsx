import React from 'react';
import AlbumTetrisBlock from './AlbumTetrisBlock.jsx'

const url = process.env.REACT_APP_API_URL

export default class relatedCollections extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      relatedCollections: []
    }

    this.fetchRelatedCollections = this.fetchRelatedCollections.bind(this)
  }

  componentDidMount() {
    this.fetchRelatedCollections()
  }

  componentDidUpdate(prevProps) {
    if (this.props.url !== prevProps.url) {
      this.fetchRelatedCollections()
    }
  }

  fetchRelatedCollections() {
    fetch(url + '/api/relatedCollections' + this.props.url, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      this.setState({relatedCollections: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    const relatedCollections = this.state.relatedCollections
    if (relatedCollections.length > 0) {
      var renderedCol1 = []
      var renderedCol2 = []
      for (var i = 0; i < relatedCollections.length; i++) {
        if (i%2) {
          renderedCol2.push([<AlbumTetrisBlock playlist={relatedCollections[i]} relatedCollections />])
        } else {
          renderedCol1.push([<AlbumTetrisBlock playlist={relatedCollections[i]} relatedCollections />])
        }
      }
      return (
        <div className="left_bottom">
          <p>Related Collections</p>
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
