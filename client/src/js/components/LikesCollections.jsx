import React from 'react';
import AlbumTetris from './AlbumTetris.jsx'

const url = process.env.REACT_APP_API_URL

export default class LikesCollections extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collections: []
    };

    this.fetchCollectionsLikes = this.fetchCollectionsLikes.bind(this)
  }

  componentDidMount() {
    this.fetchCollectionsLikes()
  }

  fetchCollectionsLikes() {
    fetch(url + '/api/you/likes/albums', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({collections: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    return (
      <AlbumTetris albums={this.state.collections} explore />
    );
  }
}
