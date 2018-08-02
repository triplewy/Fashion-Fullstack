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
            <Post key={index} mediaId={item.mediaId} genre={item.genre} username={item.username}
                  profileName={item.profileName} profile_image_src={item.profile_image_src}
                  location={item.location} userFollowers={item.userFollowers}
                  post_image_src={item.post_image_src} views={item.views} likes={item.likes}
                  reposts={item.reposts} comments={item.comments} title={item.title}
                  description={item.description} uploadDate={item.uploadDate} tags={item.tags}
                  repost_username={item.repost_username} repost_profileName={item.repost_profileName}
                  repost_location={item.repost_location} repost_userFollowers={item.repost_userFollowers}
                  repost_profile_image_src={item.repost_profile_image_src} repostDate={item.repostDate}
                  reposted={item.reposted} liked={item.liked}/>
          )
        } else if (item.playlistId) {
          return (
            <Playlist key={index} playlistId={item.playlistId} genre={item.genre} username={item.username}
                  profileName={item.profileName} profile_image_src={item.profile_image_src}
                  location={item.location} userFollowers={item.userFollowers}
                  playlist_image_srcs={item.playlist_image_srcs} likes={item.likes}
                  reposts={item.reposts} comments={item.comments} title={item.title}
                  description={item.description} uploadDate={item.uploadDate} followers={item.followers}
                  posts={item.posts} repost_username={item.repost_username} repost_profileName={item.repost_profileName}
                  repost_location={item.repost_location} repost_userFollowers={item.repost_userFollowers}
                  repost_profile_image_src={item.repost_profile_image_src} repostDate={item.repostDate}
                  reposted={item.reposted} liked={item.liked} followed={item.followed}/>
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
