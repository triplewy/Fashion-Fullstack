import React from 'react';
import RenderedPosts from './RenderedPosts.jsx'
import TypeSelector from './TypeSelector.jsx'
import InfiniteScroll from 'react-infinite-scroller'
import { Jumbotron } from 'react-bootstrap'

export default class Stream extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      streamData: [],
      type_selector_value: 0,
      hasMore: true
    };

    this.toggle_type = this.toggle_type.bind(this);
    this.fetchStream = this.fetchStream.bind(this)
    this.fetchStreamScroll = this.fetchStreamScroll.bind(this)
    this.getStream = this.getStream.bind(this)
    this.getOriginalStream = this.getOriginalStream.bind(this)
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    this.fetchStream(0)
  }

  toggle_type(e) {
    const toggleInt = e.target.name * 1
    this.setState({type_selector_value: toggleInt, streamData:[]});
    this.fetchStream(toggleInt)
  }

  fetchStream(type_selector_value) {
    const seconds = Math.round(Date.now() / 1000)
    switch (type_selector_value) {
      case 0:
        this.getStream(seconds)
        break;
      case 1:
        this.getOriginalStream(seconds)
        break;
      default:
        this.getStream(seconds)
    }
  }

  fetchStreamScroll() {
    const d = new Date(this.state.streamData[this.state.streamData.length - 1].repostDate);
    const seconds = Math.round(d.getTime() / 1000);
    switch (this.state.type_selector_value) {
      case 0:
        this.getStream(seconds)
        break;
      case 1:
        this.getOriginalStream(seconds)
        break;
      default:
        this.getStream(seconds)
    }
  }

  getStream(seconds) {
    fetch('/api/home/' + seconds, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'not logged in') {
      } else {
        var streamData = this.state.streamData
        for (var i = 0; i < data.stream.length; i++) {
          streamData.push(data.stream[i])
        }
        console.log("streamData is", streamData);
        var hasMore = true
        if (data.stream.length < 20) {
          hasMore = false
        }
        this.setState({streamData: streamData, hasMore: hasMore});
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getOriginalStream(seconds) {
    fetch('/api/homeOriginal/' + seconds, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'not logged in') {
      } else {
        var streamData = this.state.streamData
        for (var i = 0; i < data.stream.length; i++) {
          streamData.push(data.stream[i])
        }
        console.log("streamData is", streamData);
        var hasMore = true
        if (data.stream.length < 20) {
          hasMore = false
        }
        this.setState({streamData: streamData, hasMore: hasMore});
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    return (
      <div id="white_background_wrapper">
        <TypeSelector
          toggle_type={this.toggle_type}
          types={["All", "Original"]}
          type_selector_value={this.state.type_selector_value}
        />
        {this.state.streamData.length > 0 ?
          <RenderedPosts
            fetchStreamScroll={this.fetchStreamScroll}
            hasMore={this.state.hasMore}
            streamData={this.state.streamData}
          />
          :
        <Jumbotron>
          <p>
            There doesn't seem to be anything here! Check out explore to see some cool fits
          </p>
        </Jumbotron>
        }
      </div>
    );
  }
}
