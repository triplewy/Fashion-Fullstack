import React from 'react';
import Post from './Post.jsx'
import Playlist from './Playlist.jsx'

export default class RenderedPosts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollY: 0
    };
  }

  componentDidMount() {
    console.log("rendered posts mounted");
  }

  render() {
    var streamData = this.props.streamData;
    var rendered_posts = [];
    if (streamData != null) {
      rendered_posts = streamData.map((item, index) => {
        if (item.mediaId) {
          return (
              <Post key={index} index={index} mediaId={item.mediaId} genre={item.genre} username={item.username}
                    profileName={item.profileName} profile_image_src={item.profile_image_src}
                    original={item.original} imageUrls={item.imageUrls} views={item.views} likes={item.likes}
                    reposts={item.reposts} comments={item.comments} title={item.title}
                    description={item.description} uploadDate={item.uploadDate} tags={item.tags}
                    repost_username={item.repost_username} repost_profileName={item.repost_profileName}
                    repost_profile_image_src={item.repost_profile_image_src} repostDate={item.repostDate}
                    reposted={item.reposted} liked={item.liked} isPoster={item.isPoster} />
          )
        } else if (item.playlistId) {
          return (
            <Playlist key={index} index={index} playlistId={item.playlistId} genre={item.genre} username={item.username}
                  profileName={item.profileName} profile_image_src={item.profile_image_src}
                  playlist_image_srcs={item.playlist_image_srcs} likes={item.likes}
                  reposts={item.reposts} comments={item.comments} title={item.title}
                  description={item.description} uploadDate={item.uploadDate} followers={item.followers}
                  posts={item.posts} repost_username={item.repost_username} repost_profileName={item.repost_profileName}
                  repost_profile_image_src={item.repost_profile_image_src} repostDate={item.repostDate}
                  reposted={item.reposted} liked={item.liked} followed={item.followed}
                  isPoster={item.isPoster} />
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
