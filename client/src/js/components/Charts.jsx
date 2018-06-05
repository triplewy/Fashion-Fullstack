import React from 'react';
import ChartsPost from './ChartsPost.jsx'
import posts from '../json/posts.json';

var data = posts.posts;

export default class Charts extends React.Component {
  constructor(props) {
    super(props);

    var rendered_posts = [];
    if (data != null) {
      rendered_posts = data.map((item, index) => {
          return (
            <ChartsPost key={item.id} id={item.id} genre={item.genre} profile_image_url={item.user.profile_image_src}
              post_image_url={item.img_src} view_count={item.view_count}
              like_count={item.like_count} repost_count={item.repost_count}
              comment_count={item.comment_count} title={item.title}
              name={item.user.name} text={item.description} tags={item.tags} />
          )
      });
    }

    this.state = {
      post_data: data,
      time_period: "All Time",
      rendered_posts: rendered_posts
    };
  }

  render() {
      return (
          <div id="charts_div">
            {this.state.rendered_posts}
          </div>
    );
  }
}
