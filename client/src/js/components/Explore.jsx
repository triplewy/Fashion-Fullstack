import React from 'react';
import ExploreCollections from './ExploreCollections.jsx'
import ExplorePosts from './ExplorePosts.jsx'
import TypeSelector from './TypeSelector.jsx'
import GenreSelector from './GenreSelector.jsx'
import TimePeriod from './TimePeriod.jsx'
import ImageTetris from './ImageTetris.jsx'

export default class Explore extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      topGenres: []
      // genre: '',
      // type_selector_value: 0,
      // timePeriod: 1,
      // posts: []
    };

    this.fetchTopGenres = this.fetchTopGenres.bind(this)
    // this.toggle_type = this.toggle_type.bind(this);
    // this.toggleTime = this.toggleTime.bind(this)
    // this.fetchExploreHot = this.fetchExploreHot.bind(this)
    // this.fetchExploreNew = this.fetchExploreNew.bind(this)
    // this.fetchExploreTop = this.fetchExploreTop.bind(this)
    // this.fetchExploreRandom = this.fetchExploreRandom.bind(this)
    // this.searchGenre = this.searchGenre.bind(this)
    // this.onChange = this.onChange.bind(this)
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    // this.fetchExploreHot(this.state.genre)
  }

  fetchTopGenres() {
    fetch('/api/topGenres', {
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
  // toggle_type(e) {
  //   const genre = this.state.genre
  //   if (e.target.name == 0) {
  //     this.fetchExploreHot(genre)
  //   } else if (e.target.name == 1) {
  //     this.fetchExploreNew(genre)
  //   } else if (e.target.name == 2) {
  //     this.fetchExploreTop(genre, this.state.timePeriod)
  //   } else if (e.target.name == 3) {
  //     this.fetchExploreRandom(genre, this.state.timePeriod)
  //   }
  //   this.setState({type_selector_value: e.target.name});
  // }
  //
  // toggleTime(e) {
  //   const genre = this.state.genre
  //   this.setState({timePeriod: e.target.value});
  //   switch (this.state.type_selector_value) {
  //     case 2:
  //       this.fetchExploreTop(genre, e.target.value)
  //       break;
  //     case 3:
  //       this.fetchExploreRandom(genre, e.target.value)
  //       break;
  //     default:
  //       this.fetchExploreTop(genre, e.target.value)
  //   }
  // }
  //
  // fetchExploreHot(genre) {
  //   fetch('/api/explore/hot/' + genre, {
  //     credentials: 'include'
  //   })
  //   .then(res => res.json())
  //   .then(data => {
  //     console.log(data);
  //     this.setState({posts: data});
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });
  // }
  //
  // fetchExploreNew(genre) {
  //   fetch('/api/explore/new/' + genre, {
  //     credentials: 'include'
  //   })
  //   .then(res => res.json())
  //   .then(data => {
  //     console.log(data);
  //     this.setState({posts: data});
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });
  // }
  //
  // fetchExploreTop(genre, timePeriod) {
  //   fetch('/api/explore/top/' + genre + '/' + timePeriod, {
  //     credentials: 'include'
  //   })
  //   .then(res => res.json())
  //   .then(data => {
  //     console.log(data);
  //     this.setState({posts: data});
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });
  // }
  //
  // fetchExploreRandom(genre, timePeriod) {
  //   fetch('/api/explore/random/' + genre + '/' + timePeriod, {
  //     credentials: 'include'
  //   })
  //   .then(res => res.json())
  //   .then(data => {
  //     console.log(data);
  //     this.setState({posts: data});
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });
  // }
  //
  // searchGenre(genre) {
  //   this.setState({genre: genre})
  //   switch (this.state.type_selector_value) {
  //     case 0:
  //       this.fetchExploreHot(genre)
  //     break;
  //     case 1:
  //       this.fetchExploreNew(genre)
  //     break;
  //     case 2:
  //       this.fetchExploreTop(genre, this.state.timePeriod)
  //       break;
  //     case 3:
  //       this.fetchExploreRandom(genre, this.state.timePeriod)
  //       break;
  //     default:
  //       this.fetchExploreHot(genre)
  //   }
  // }
  //
  // onChange(event, { newValue, method }) {
  //   this.setState({genre: newValue})
  // }

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
        {/* <TypeSelector toggle_type={this.toggle_type} types={["Hot", "New", "Top", "Random"]}
        type_selector_value={this.state.type_selector_value}
        right={
          <div className="explore_right">
            <GenreSelector searchGenre={this.searchGenre} genre={this.state.genre} onChange={this.onChange}/>
            {this.state.type_selector_value > 1 ? <TimePeriod toggleTime={this.toggleTime}/> : null}
          </div>
        }/>
        <ImageTetris posts={this.state.posts} explore /> */}
    </div>
    );
  }
}
