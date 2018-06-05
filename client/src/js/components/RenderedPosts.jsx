import React from 'react';
import Post from './Post.jsx'

export default class RenderedPosts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    var post_data = this.props.post_data;
    var rendered_posts = [];
    if (post_data != null) {
      rendered_posts = post_data.map((item, index) => {
          return (
            <Post key={index} id={item.postId} genre={item.genre} profile_image_url={item.user.profile_image_src}
              post_image_url={item.img_src} views={item.views} likes={item.likes}
              reposts={item.reposts} comments={item.comments} title={item.title}
              profileName={item.user.profileName} username={item.user.username}
              description={item.description} date={item.date} tags={item.tags} />
          )
      });
    }
      return (
        <div>
          {rendered_posts}
        </div>
    );
  }
}
