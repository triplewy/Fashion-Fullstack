import React from 'react';
import ExploreCollections from './ExploreCollections.jsx'
import ExplorePosts from './ExplorePosts.jsx'
import TypeSelector from './TypeSelector.jsx'
import GenreSelector from './GenreSelector.jsx'
import TimePeriod from './TimePeriod.jsx'
import ImageTetris from './ImageTetris.jsx'

const url = process.env.REACT_APP_API_URL

export default class Explore extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      topGenres: []
    };

    this.fetchTopGenres = this.fetchTopGenres.bind(this)
  }

  componentDidMount() {
    window.scrollTo(0, 0)
  }

  fetchTopGenres() {
    fetch(url + '/api/topGenres', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({topGenres: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    return (
      <div id="white_background_wrapper">
        {this.props.home ?
          null
          :
          <p className="page_title">Explore</p>
        }
        <ExploreCollections topGenres={this.state.topGenres} />
        <ExplorePosts topGenres={this.state.topGenres} />
    </div>
    );
  }
}
