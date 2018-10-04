import React from 'react';
import Post from './Post.jsx'
import Playlist from './Playlist.jsx'
import InfiniteScroll from 'react-infinite-scroller'

export default class RenderedPosts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.backToTop = this.backToTop.bind(this)
  }

  backToTop(e) {
    window.scrollTo(0,0)
  }

  render() {
    var streamData = this.props.streamData;
    var rendered_posts = [];
    if (streamData != null) {
      rendered_posts = streamData.map((item, index) => {
        if (item.mediaId) {
          return (
            <Post key={index} index={index} post={item} />
          )
        } else if (item.playlistId) {
          var posts = item.posts
          posts.sort(function(a, b) {
            return b.playlistIndex - a.playlistIndex;
          })
          item.posts = posts
          return (
            <Playlist key={index} index={index} playlist={item} />
          )
        } else {
          return (
            <p>Error</p>
          )
        }
      })
    }
    return (
      <div>
        <InfiniteScroll
          initialLoad={false}
          loadMore={this.props.fetchStreamScroll.bind(this)}
          hasMore={this.props.hasMore}
          loader={<div className="loader" key={0}>Loading ...</div>}
          useWindow={true}
        >
          {rendered_posts}
        </InfiniteScroll>
        {this.props.hasMore ?
          null
          :
          <div className="back_to_top" onClick={this.backToTop}>Back to top</div>
        }
      </div>
    );
  }
}
