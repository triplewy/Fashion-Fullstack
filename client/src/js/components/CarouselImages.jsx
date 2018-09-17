import React from 'react';
import { Carousel } from 'react-bootstrap'
import { setAspectRatio } from './aspectRatio.js'

export default class CarouselImages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: this.props.carouselIndex,
      direction: null
    };

    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.carouselIndex !== prevProps.carouselIndex) {
      this.setState({index: this.props.carouselIndex})
    }
  }

  handleSelect(selectedIndex, e) {
    this.setState({index: selectedIndex, direction: e.direction});
  }

  render() {
    const { index, direction } = this.state;
    var renderedImages = [];
    if (this.props.imageUrls) {
      var width = 0
      var height = 0;
      if (this.props.imageUrls.length === 1) {
        [width, height] = setAspectRatio(this.props.imageUrls[0].width, this.props.imageUrls[0].height)
        return (
          <div className="post_image" style={{backgroundImage: 'url(' + this.props.imageUrls[0].imageUrl + ')',
            backgroundSize: width + "px " + height + "px", width: width, height: height}} />
        )
      } else {
        renderedImages = this.props.imageUrls.map((item, index) => {
          [width, height] = setAspectRatio(item.width, item.height)
          return (
            <Carousel.Item key={index}>
              <div className="post_image" style={{backgroundImage: 'url(' + item.imageUrl + ')',
                backgroundSize: width + "px " + height + "px", width: width, height: height}} />
            </Carousel.Item>
          )
        })
        return (
          <Carousel
            interval={null}
            activeIndex={index}
            direction={direction}
            onSelect={this.handleSelect}
          >
            {renderedImages}
          </Carousel>
        )
      }
    } else {
      return null
    }
  }
}
