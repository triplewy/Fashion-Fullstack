import React from 'react';
import RenderedPosts from './RenderedPosts.jsx'
import TypeSelector from './TypeSelector.jsx'
import {Redirect} from 'react-router-dom';

export default class Stream extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: false,
      response: '',
      streamData: [],
      type_selector_value: 0
    };

    this.toggle_type = this.toggle_type.bind(this);
    this.getStream = this.getStream.bind(this)
    this.getOriginalStream = this.getOriginalStream.bind(this)
  }

  componentDidMount() {
    console.log("stream mounted");
    this.getStream()
    window.scrollTo(0, 0)
  }

  toggle_type(e) {
    if (e.target.name == 1) {
      console.log("og");
      this.getOriginalStream()
    } else {
      this.getStream()
    }
    this.setState({type_selector_value: e.target.name});
  }

  getStream() {
    fetch('/api/home', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'not logged in') {
        this.setState({redirect: true});
      }
      var streamData = data.stream
      console.log("streamData is", streamData);
      this.setState({streamData: streamData});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getOriginalStream() {
    fetch('/api/homeOriginal', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'not logged in') {
        this.setState({redirect: true});
      }
      console.log("api home data is", data);
      var streamData = data.stream
      console.log("streamData is", streamData);
      this.setState({streamData: streamData});
    })
    .catch((error) => {
      console.error(error);
    });
  }


  render() {
    if (this.state.redirect) {
      return <Redirect to={'/home'}/>
    }
      return (
        <div id="white_background_wrapper">
          <TypeSelector toggle_type={this.toggle_type} types={["All", "Original"]}
          type_selector_value={this.state.type_selector_value}/>
          <div id="content_wrapper">
            <RenderedPosts streamData={this.state.streamData} />
          </div>
        </div>
    );
  }
}
