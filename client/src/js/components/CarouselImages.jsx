import React from 'react';
import { Carousel } from 'react-bootstrap'
import { setAspectRatio, setAspectRatioImageTetrisBlock, setAspectRatioSinglePost, setAspectRatioRelatedPosts } from './aspectRatio.js'

export default class CarouselImages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      direction: null
    };

    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(selectedIndex, e) {
    this.setState({direction: e.direction});
    this.props.setCarouselIndex(selectedIndex)
  }

  render() {
    const { direction } = this.state;
    var renderedImages = [];
    if (this.props.imageUrls) {
      var width = 0
      var height = 0;
      if (this.props.imageUrls.length === 1) {
        if (this.props.explore) {
          [width, height] = setAspectRatioImageTetrisBlock(this.props.imageUrls[0].width, this.props.imageUrls[0].height)
        } else if (this.props.singlePost) {
          [width, height] = setAspectRatioSinglePost(this.props.imageUrls[0].width, this.props.imageUrls[0].height)
        } else if (this.props.relatedPosts) {
          [width, height] = setAspectRatioRelatedPosts(this.props.imageUrls[0].width, this.props.imageUrls[0].height)
        } else {
          [width, height] = setAspectRatio(this.props.imageUrls[0].width, this.props.imageUrls[0].height)
        }
        return (
          <div className="post_image" style={{backgroundImage: 'url(' + this.props.imageUrls[0].imageUrl + ')',
            // backgroundSize: width + "px " + height + "px",
            width: width, height: height,
            borderRadius: this.props.singlePost ? "8px" : ""}} />
        )
      } else {
        renderedImages = this.props.imageUrls.map((item, index) => {
          if (this.props.explore) {
            [width, height] = setAspectRatioImageTetrisBlock(item.width, item.height)
          } else if (this.props.singlePost) {
            [width, height] = setAspectRatioSinglePost(item.width, item.height)
          } else if (this.props.relatedPosts) {
            [width, height] = setAspectRatioRelatedPosts(item.width, item.height)
          } else {
            [width, height] = setAspectRatio(item.width, item.height)
          }
          return (
            <Carousel.Item key={index}>
              <div className="post_image" style={{backgroundImage: 'url(' + item.imageUrl + ')',
                // backgroundSize: width + "px " + height + "px",
                width: width, height: height,
                borderRadius: this.props.singlePost ? "8px" : ""}} />
            </Carousel.Item>
          )
        })
        return (
          <Carousel
            interval={null}
            activeIndex={this.props.carouselIndex}
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
