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
            <Post key={index} id={item.mediaId} genre={item.genre} user={item.user}
              post_image_src={item.post_image_src} views={item.views} likes={item.likes}
              reposts={item.reposts} comments={item.comments} title={item.title}
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
