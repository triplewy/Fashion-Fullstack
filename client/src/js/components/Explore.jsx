import React from 'react';
import TypeSelector from './TypeSelector.jsx'
import TimePeriod from './TimePeriod.jsx'
import ImageTetris from './ImageTetris.jsx'

{/* <div id="genre_selector_div">
  <p id="genre_selector_title">Genre:</p>
  <input name="genre_selector" id="genre_selector_input"
    placeholder="All"></input>
</div> */}

export default class Explore extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      type_selector_value: 0,
      posts: []
    };

    this.toggle_type = this.toggle_type.bind(this);
    this.fetchExploreHot = this.fetchExploreHot.bind(this)
    this.fetchExploreNew = this.fetchExploreNew.bind(this)
    this.fetchExploreTop = this.fetchExploreTop.bind(this)
  }

  componentDidMount() {
    this.fetchExploreHot()
  }

  toggle_type(e) {
    if (e.target.name == 0) {
      this.fetchExploreHot()
    } else if (e.target.name == 1) {
      this.fetchExploreNew()
    } else if (e.target.name == 2) {
      this.fetchExploreTop()
    }
    this.setState({type_selector_value: e.target.name});
  }

  fetchExploreHot() {
    fetch('/api/explore/hot', {
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

  fetchExploreNew() {
    fetch('/api/explore/new', {
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

  fetchExploreTop() {
    fetch('/api/explore/top', {
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
      <div id="white_background_wrapper">
        <TypeSelector toggle_type={this.toggle_type} types={["Hot", "New", "Top", "Random"]}
        type_selector_value={this.state.type_selector_value}
        right={this.state.type_selector_value == 2 ? <TimePeriod toggleTime={this.toggleTime}/> : null}/>
        <ImageTetris posts={this.state.posts}/>
    </div>
    );
  }
}
