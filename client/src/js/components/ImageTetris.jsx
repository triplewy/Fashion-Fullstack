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
      imageUrls1: [{imageUrl: image1, mediaId: 1}, {imageUrl: image7, mediaId: 2}],
      imageUrls2: [{imageUrl: image2, mediaId: 1}, {imageUrl: image5, mediaId: 2}],
      imageUrls3: [{imageUrl: image3, mediaId: 1}, {imageUrl: image4, mediaId: 2}],
      imageUrls4: [{imageUrl: image6, mediaId: 1}]
    };

  }

  componentDidMount() {

  }

  render() {
    var renderedCol1 = [];
    var renderedCol2 = [];
    var renderedCol3 = [];
    var renderedCol4 = [];
    if (this.state.imageUrls1 != null) {
      renderedCol1 = this.state.imageUrls1.map((item, index) => {
        return (
          <ImageTetrisBlock key={item.mediaId} mediaId={item.mediaId} imageUrl={item.imageUrl} />
        )
      })
    }
    if (this.state.imageUrls2 != null) {
      renderedCol2 = this.state.imageUrls2.map((item, index) => {
        return (
          <ImageTetrisBlock key={item.mediaId} mediaId={item.mediaId} imageUrl={item.imageUrl} />
        )
      })
    }
    if (this.state.imageUrls3 != null) {
      renderedCol3 = this.state.imageUrls3.map((item, index) => {
        return (
          <ImageTetrisBlock key={item.mediaId} mediaId={item.mediaId} imageUrl={item.imageUrl} />
        )
      })
    }
    if (this.state.imageUrls4 != null) {
      renderedCol4 = this.state.imageUrls4.map((item, index) => {
        return (
          <ImageTetrisBlock key={item.mediaId} mediaId={item.mediaId} imageUrl={item.imageUrl} />
        )
      })
    }
    return (
      <div className="image_tetris_wrapper">
        <div className="tetris_column">
          {renderedCol1}
        </div>
        <div className="tetris_column">
          {renderedCol2}
        </div>
        <div className="tetris_column">
          {renderedCol3}
        </div>
        <div className="tetris_column">
          {renderedCol4}
        </div>
      </div>
    );
  }
}
