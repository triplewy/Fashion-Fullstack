import React from 'react';
import InputTag from './InputTag.jsx';
import UploadImages from './UploadImages.jsx'
import UploadPostMetadata from './UploadPostMetadata.jsx'
import CarouselImages from './CarouselImages.jsx'
import { Redirect } from 'react-router-dom'

const url = process.env.REACT_APP_API_URL

export default class UploadMetadata extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputTags: [],
      tagX: 0,
      tagY: 0,
      displayTagInput: 'none',
      editTagIndex: -1,
      editTag: {itemType:'shirt', itemBrand: '', itemName: '', itemLink: '', original: false},
      carouselIndex: 0,
      back: false,

      progress: 0,
      submitted: false,
      uploaded: false,

      showOverlay: false,
      target: null,

      displayTagLocation: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.upload = this.upload.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleTagSave = this.handleTagSave.bind(this)
    this.handleTagCancel = this.handleTagCancel.bind(this)
    this.handleTagDelete = this.handleTagDelete.bind(this)
    this.handleTagEdit = this.handleTagEdit.bind(this)
    this.subtractCarouselIndex = this.subtractCarouselIndex.bind(this)
    this.addCarouselIndex = this.addCarouselIndex.bind(this)
    this.setCarouselIndex = this.setCarouselIndex.bind(this)
    this.setTagCarouselIndex = this.setTagCarouselIndex.bind(this)
    this.goBack = this.goBack.bind(this)
  }

  handleSubmit(title, url, genre, description) {
    var original = 0
    for (var i = 0; i < this.state.inputTags.length; i++) {
      if (this.state.inputTags[i].original) {
        original = 1
        break;
      }
    }
    var formData = new FormData();
    for (var j = 0; j < this.props.files.length; j++) {
      formData.append('image', this.props.files[j].file, this.props.files[j].file.name)
    }
    formData.append('title', title);
    formData.append('url', url);
    formData.append('genre', genre);
    formData.append('description', description);
    formData.append('original', original);
    formData.append('inputTags', JSON.stringify(this.state.inputTags));
    formData.append('dimensions', JSON.stringify(this.props.dimensions))

    this.setState({submitted: true})
    this.upload(formData)
  }

  upload(formData) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.onreadystatechange = () => {
     if(xhr.readyState === 4 && xhr.status === 200){
         console.log(xhr.responseText);
         this.setState({uploaded: true})
      }
    }

    xhr.upload.onprogress = (e) => {
      console.log("loaded", e.loaded);
      console.log("total", e.total);
      this.setState({progress: e.loaded/e.total})
    }

    xhr.open('POST', url + '/api/upload');
    xhr.send(formData)
  }

  handleClick(e) {
    if (e.target.className === "post_image") {
      var bounds = e.target.getBoundingClientRect();
      var x = (e.clientX - bounds.left)/bounds.width * 100;
      var y = (e.clientY - bounds.top)/bounds.height * 100;
      console.log("x is", x);
      console.log("y is", y);
      this.setState({
        tagX: x,
        tagY: y,
        displayTagInput: 'block'
      })
    }
  }

  handleTagSave(itemType, itemBrand, itemName, link, original, e) {
    if (this.state.inputTags.length > 4) {
      this.setState({showOverlay: true, target: e.target})
      setTimeout(function() {
        this.setState({showOverlay: false})
      }.bind(this), 2000)
    } else {
      var tempInputTags = this.state.inputTags
      var saveTag = {
        itemType: itemType,
        itemBrand: itemBrand,
        itemName: itemName,
        itemLink: link,
        original: original,
        x: this.state.tagX,
        y: this.state.tagY,
        imageIndex: this.state.carouselIndex
      }
      if (this.state.editTagIndex >= 0) {
        tempInputTags[this.state.editTagIndex] = saveTag
      } else {
        tempInputTags.push(saveTag)
      }
      this.setState({
        inputTags: tempInputTags,
        displayTagInput: 'none',
        editTag: {itemType:'shirt', itemBrand: '', itemName: '', itemLink: '', original: false},
        editTagIndex: -1
      })
    }
  }

  handleTagCancel(e) {
    this.setState({
      displayTagInput: 'none',
      editTag: {itemType:'shirt', itemBrand: '', itemName: '', itemLink: '', original: false},
      editTagIndex: -1
    })
  }

  handleTagDelete(index) {
    var tempArray = this.state.inputTags
    tempArray.splice(index, 1)
    this.setState({inputTags: tempArray})
  }

  handleTagEdit(index) {
    var tag = this.state.inputTags[index]
    this.setState({
      tagX: tag.x,
      tagY: tag.y,
      displayTagInput: 'block',
      editTagIndex: index,
      editTag: tag,
      carouselIndex: tag.imageIndex
    })
  }

  subtractCarouselIndex(e) {
    e.stopPropagation()
    var length = this.props.files.length
    var index = this.state.carouselIndex
    index -= 1
    if (index < 0) {
      this.setState({carouselIndex: length - 1})
    } else {
      this.setState({carouselIndex: index})
    }
  }

  addCarouselIndex(e) {
    e.stopPropagation()
    var length = this.props.files.length
    var index = this.state.carouselIndex
    index += 1
    if (index >= length) {
      this.setState({carouselIndex: 0})
    } else {
      this.setState({carouselIndex: index})
    }
  }

  goBack(e) {
    this.setState({back: true})
  }

  setCarouselIndex(index) {
    this.setState({carouselIndex: index})
  }

  setTagCarouselIndex(index, x, y, show) {
    if (show) {
      this.setState({carouselIndex: index, tagX: x, tagY: y, displayTagLocation: show})
    } else {
      this.setState({displayTagLocation: show})
    }
  }

  render() {
    if (this.state.uploaded) {
      return (
        <Redirect to='/' />
      )
    }

    // var renderedCarousel = [];
    // var renderedCarouslIndicators = []
    // var length = this.props.files.length
    // if (length > 0) {
    //   for (var i = 0; i < this.props.files.length; i++) {
    //     var width = this.props.dimensions[i].display.width
    //     var height = this.props.dimensions[i].display.height
    //     renderedCarousel.push(
    //       <div className={i === this.state.carouselIndex ? "item active" : "item"} key={i}>
    //         <div className="post_image" style={{backgroundImage: 'url(' + this.props.files[i].preview + ')', width: width, height: height}} />
    //       </div>
    //     )
    //     renderedCarouslIndicators.push(
    //       <li key={i} className={i === this.state.carouselIndex ? "active" : ""}></li>
    //     )
    //   }
    // }
    if (this.state.back) {
      return (
        <UploadImages files={this.props.files} dimensions={this.props.dimensions}/>
      )
    } else {
      return (
        <div id="white_background_wrapper">
          <p id="upload_title">Upload</p>
          <div id="upload_images_wrapper">
            <div id="tag_click_div_wrapper">
              <div style={{position: "relative"}} onClick={this.handleClick}>
                <div className="tag_location" style={{left: this.state.tagX + '%', top: this.state.tagY + '%', opacity: this.state.displayTagLocation ? 1 : 0}} />
                <InputTag
                  left={this.state.tagX}
                  top={this.state.tagY}
                  display={this.state.displayTagInput}
                  handleTagSave={this.handleTagSave}
                  handleTagCancel={this.handleTagCancel}
                  showOverlay={this.state.showOverlay}
                  target={this.state.target}
                  index={this.state.editTagIndex}
                  tag={this.state.editTag}
                />
                <CarouselImages
                  imageUrls={this.props.files}
                  carouselIndex={this.state.carouselIndex}
                  setCarouselIndex={this.setCarouselIndex}
                />
              {/* {this.props.files.length === 1 ?
                <div className="post_image" style={{backgroundImage: 'url(' + this.props.files[0].preview + ')',
                  backgroundSize: (this.props.dimensions[0].display.width + "px " + this.props.dimensions[0].display.height + "px"),
                  width: this.props.dimensions[0].display.width, height: this.props.dimensions[0].display.height}} />
                :
                <div className="carousel slide">
                  <ol className="carousel-indicators">
                    {renderedCarouslIndicators}
                   </ol>
                   <div className="carousel-inner">
                     {renderedCarousel}
                  </div>
                   <a className="carousel-control left" role="button">
                     <span className="glyphicon glyphicon-chevron-left" onClick={this.subtractCarouselIndex}>
                     </span>
                     <span className="sr-only">Previous</span>
                   </a>
                   <a className="carousel-control right" role="button">
                     <span className="glyphicon glyphicon-chevron-right" onClick={this.addCarouselIndex}>
                     </span>
                     <span className="sr-only">Next</span>
                   </a>
                </div>
                } */}
              </div>
            </div>
            <UploadPostMetadata
              modify
              tags={this.state.inputTags}
              handleTagDelete={this.handleTagDelete}
              handleTagEdit={this.handleTagEdit}
              goBack={this.goBack}
              handleSubmit={this.handleSubmit}
              carouselIndex={this.state.carouselIndex}
              setTagCarouselIndex={this.setTagCarouselIndex}
              submitted={this.state.submitted}
              progress={this.state.progress}
            />
          </div>
          <div id="upload_disclaimer">
            <p>Descriptive info and stuff to make the page slightly longer vertically</p>
          </div>
        </div>
      )
    }
  }
}
