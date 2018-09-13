import React from 'react';
import { Carousel } from 'react-bootstrap'

export default class CarouselImages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.setAspectRatio = this.setAspectRatio.bind(this)
  }

  setAspectRatio(width, height) {
    var aspectRatio = width/height
    if (aspectRatio > 0.75 && width > 660) {
      aspectRatio = width/660
      return [660, height/aspectRatio]
    } else if (aspectRatio <= 0.75 && height > 880) {
      aspectRatio = height/880
      return [width/aspectRatio, 880]
    } else {
      return [width, height]
    }
  }

  render() {

    var renderedImages = [];
    if (this.props.imageUrls) {
      var width = 0
      var height = 0;
      if (this.props.imageUrls.length === 1) {
        [width, height] = this.setAspectRatio(this.props.imageUrls[0].width, this.props.imageUrls[0].height)
        return (
          <div className="post_image" style={{backgroundImage: 'url(' + this.props.imageUrls[0].imageUrl + ')',
            width: width, height: height}} />
        )
      } else {
        renderedImages = this.props.imageUrls.map((item, index) => {
          [width, height] = this.setAspectRatio(item.width, item.height)
          return (
            <Carousel.Item key={index}>
              <div className="post_image" style={{backgroundImage: 'url(' + item.imageUrl + ')', width: width, height: height}} />
            </Carousel.Item>
          )
        })
        return (
          <Carousel interval={null}>
            {renderedImages}
          </Carousel>
        )
      }
    } else {
      return null
    }
  }
}
