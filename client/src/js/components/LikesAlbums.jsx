import React from 'react';
import AlbumTetris from './AlbumTetris.jsx'
import TypeSelector from './TypeSelector.jsx'
import { Redirect } from 'react-router-dom';

export default class LikesAlbums extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      albums: [],
      redirect: false
    };

    this.toggle_type = this.toggle_type.bind(this);
    this.fetchAlbumsLikes = this.fetchAlbumsLikes.bind(this)
  }

  componentDidMount() {
    this.fetchAlbumsLikes()
  }

  toggle_type(e) {
    if (e.target.name == 0) {
      this.setState({redirect: true})
    }
  }

  fetchAlbumsLikes() {
    fetch('/api/you/likes/albums', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({albums: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    if (this.state.redirect) {
      return (
        <Redirect to="/you/likes/posts" />
      )
    }
    return (
      <div id="white_background_wrapper">
        <p className="page_title">Likes</p>
        <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["Posts", "Albums"]}
        type_selector_value={1}/>
        <AlbumTetris albums={this.state.albums} explore />
    </div>
    );
  }
}
