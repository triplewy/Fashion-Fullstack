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
        console.log("item source is", item.source);
        if (item.source == 'playlists') {
          console.log("yoooooooo");
          return (
            <Playlist key={index} id={item.playlistId} genre={item.genre} user={item.user}
              playlist_image_srcs={item.playlist_image_srcs} likes={item.likes}
              reposts={item.reposts} comments={item.comments} title={item.title}
              description={item.description} date={item.date} followers={item.followers}
              posts={item.posts}/>
            )
        } else {
          return (
            <Post key={index} id={item.mediaId} genre={item.genre} user={item.user}
              post_image_src={item.post_image_src} views={item.views} likes={item.likes}
              reposts={item.reposts} comments={item.comments} title={item.title}
              description={item.description} date={item.date} tags={item.tags} />
          )
        }
      });
    }
      return (
        <div>
          {rendered_posts}
        </div>
    );
  }
}
