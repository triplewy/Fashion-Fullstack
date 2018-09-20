import React from 'react';
import image1 from 'images/testImages/image1.jpg'
import image2 from 'images/testImages/image2.jpg'
import image3 from 'images/testImages/image3.jpg'
import image4 from 'images/testImages/image4.jpg'
import image5 from 'images/testImages/image5.jpg'
import image6 from 'images/testImages/image6.jpg'
import image7 from 'images/testImages/image7.jpg'
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
          renderedColumns.push([<ImageTetrisBlock key={i} post={posts[i]} />])
        } else {
          renderedColumns[i%3].push(<ImageTetrisBlock key={i} post={posts[i]} />)
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
