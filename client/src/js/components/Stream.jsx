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
    this.getStream = this.getStream.bind(this)
    this.getStreamScroll = this.getStreamScroll.bind(this)
    this.getOriginalStream = this.getOriginalStream.bind(this)
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    this.getStream()
  }

  toggle_type(e) {
    if (e.target.name == 1) {
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
      }
      var streamData = data.stream
      console.log("streamData is", streamData);
      var hasMore = true
      if (streamData.length < 20) {
        hasMore = false
      }
      this.setState({streamData: streamData, hasMore: hasMore});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getStreamScroll() {
    const d = new Date(this.state.streamData[this.state.streamData.length - 1].repostDate);
    const seconds = Math.round(d.getTime() / 1000);

    fetch('/api/home/' + seconds, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'not logged in') {
      } else {
        var streamData = this.state.streamData
        if (streamData.length > 0) {
          for (var i = 0; i < data.stream.length; i++) {
            streamData.push(data.stream[i])
          }
          var hasMore = true
          if (streamData.length < 20) {
            hasMore = false
          }
          this.setState({streamData: streamData, hasMore: hasMore});
        } else {
          console.log("no data");
          this.setState({hasMore: false})
        }
      }

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
    return (
      <div id="white_background_wrapper">
        <TypeSelector
          toggle_type={this.toggle_type}
          types={["All", "Original"]}
          type_selector_value={this.state.type_selector_value}
        />
        {this.state.streamData.length > 0 ?
        <InfiniteScroll
          initialLoad={false}
          loadMore={this.getStreamScroll.bind(this)}
          hasMore={this.state.hasMore}
          loader={<div className="loader" key={0}>Loading ...</div>}
          useWindow={true}
        >
          <RenderedPosts streamData={this.state.streamData} />
        </InfiniteScroll>
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
