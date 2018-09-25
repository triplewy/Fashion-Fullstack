import React from 'react';
import AlbumTetrisBlock from './AlbumTetrisBlock.jsx'

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
    fetch('/api/relatedCollections/' + this.props.url, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({relatedCollections: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    const relatedCollections = this.state.relatedCollections
    if (relatedCollections.length > 0) {
      var renderedCollections = [];
      renderedCollections = relatedCollections.map((item, index) => {
        return (
          <AlbumTetrisBlock key={index} playlist={item} relatedCollections />
        )
      })
      return (
        <div className="left_bottom">
          <p>Related Collections</p>
          {renderedCollections}
        </div>
      )
    } else {
      return (
        null
      )
    }
  }
}
