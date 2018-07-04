import React from 'react';
import Post from './Post.jsx'
import Playlist from './Playlist.jsx'

export default class RenderedPosts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    var streamData = this.props.streamData;
    var rendered_posts = [];
    if (streamData != null) {
      rendered_posts = streamData.map((item, index) => {
        if (item.mediaId) {
          return (
            <Post key={index} mediaId={item.mediaId} genre={item.genre} user={item.user}
                  post_image_src={item.post_image_src} views={item.views} likes={item.likes}
                  reposts={item.reposts} comments={item.comments} title={item.title}
                  description={item.description} uploadDate={item.uploadDate} tags={item.tags}
                  reposter={item.reposter} repostDate={item.repostDate}/>
          )
        } else if (item.playlistId) {
          return (
            <Playlist key={index} playlistId={item.playlistId} genre={item.genre} user={item.user}
                  playlist_image_srcs={item.playlist_image_srcs} likes={item.likes}
                  reposts={item.reposts} comments={item.comments} title={item.title}
                  description={item.description} uploadDate={item.uploadDate} followers={item.followers}
                  posts={item.posts} reposter={item.reposter} repostDate={item.repostDate}/>
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
          {rendered_posts}
        </div>
    );
  }
}
