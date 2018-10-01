import React from 'react';
import ImageTetrisBlock from './ImageTetrisBlock.jsx'


export default class ImageTetris extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    var renderedColumns = []
    const posts = this.props.posts
    if (posts.length > 0) {
      for (var i = 0; i < posts.length; i++) {
        if (i < 3) {
          renderedColumns.push([<ImageTetrisBlock key={i} post={posts[i]} explore={this.props.explore} toggleLoginModal={this.props.toggleLoginModal} />])
        } else {
          renderedColumns[i%3].push(<ImageTetrisBlock key={i} post={posts[i]} explore={this.props.explore} toggleLoginModal={this.props.toggleLoginModal} />)
        }
      }
    }
    return (
      <div className="image_tetris_wrapper">
        <div className="tetris_column">
          {renderedColumns[0]}
        </div>
        <div className="tetris_column">
          {renderedColumns[1]}
        </div>
        <div className="tetris_column">
          {renderedColumns[2]}
        </div>
      </div>
    );
  }
}
