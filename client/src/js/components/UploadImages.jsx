import React from 'react';
import UploadMetadata from './UploadMetadata.jsx'
import * as loadImage from 'blueimp-load-image'
import close_icon from 'images/close-icon.png'

export default class UploadImages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: this.props.files,
      imagePreviewUrls: [],
      currentImageIndex: 0,
      continue: false
    };

    this.readImageFile = this.readImageFile.bind(this);
    this.previewImages = this.previewImages.bind(this)
    this.imageProcessor = this.imageProcessor.bind(this)
    this.setCurrentImageIndex = this.setCurrentImageIndex.bind(this)
    this.removeImage = this.removeImage.bind(this)
    this.setContinue = this.setContinue.bind(this)
  }

  componentDidMount() {
    if (this.state.files.length > 0) {
      this.previewImages(this.state.files)
    } else {
      this.setState({imageUploaded: false})
    }
  }

  readImageFile(e) {
    e.preventDefault();
    this.previewImages(e.target.files)
  }

  async previewImages(files) {
    for (var i = 0; i < files.length; i ++) {
      await this.imageProcessor(files[i])
    }
    this.setState({imageUploaded: true})
  }

  imageProcessor(file) {
    const loadImageOptions = { canvas: true, maxWidth: 660, maxHeight: 880}
    loadImage.parseMetaData(file, (data) => {
      if (data.exif) {
        loadImageOptions.orientation = data.exif.get('Orientation')
      }
      loadImage(file, (canvas) => {
        file.preview = canvas.toDataURL(file.type)
        var files = this.state.files
        var imagePreviewUrls = this.state.imagePreviewUrls
        files.push(file)
        imagePreviewUrls.push(file.preview)
        this.setState({
          files: files,
          imagePreviewUrls: imagePreviewUrls
        })
      }, loadImageOptions)
    })
  }

  setCurrentImageIndex(index) {
    if (this.state.currentImageIndex !== index) {
      this.setState({currentImageIndex: index})
    }
  }

  removeImage(index) {
    var tempPreviews = this.state.imagePreviewUrls
    var tempFiles = this.state.files
    tempPreviews.splice(index, 1)
    tempFiles.splice(index, 1)
    if (index <= this.state.currentImageIndex) {
      if (index === 0) {
        this.setState({files: tempFiles, imagePreviewUrls: tempPreviews})
      } else {
        this.setState({files: tempFiles, imagePreviewUrls: tempPreviews, currentImageIndex: this.state.currentImageIndex - 1})
      }
    } else {
      this.setState({files: tempFiles, imagePreviewUrls: tempPreviews})
    }
  }

  setContinue(e) {
    if (!this.state.continue) {
      this.setState({continue: true})
    } else {
      this.setState({continue: false})
    }
  }

  render() {
    if (this.state.continue) {
      return (
        <UploadMetadata files={this.state.files} imagePreviewUrls={this.state.imagePreviewUrls} />
      )
    } else {
      var renderedList = [];
      var length = this.state.imagePreviewUrls.length
      if (length > 0) {
        renderedList = this.state.imagePreviewUrls.map((item, index) => {
          return (
            <li key={index} onClick={this.setCurrentImageIndex.bind(this, index)}>
              <div>
                <img src={this.state.imagePreviewUrls[index]}></img>
                <button className="remove_image_button" onClick={this.removeImage.bind(this, index)}
                  style={{backgroundImage: 'url(' + close_icon + ')'}}></button>
              </div>
            </li>
          )
        })
        renderedList.push(
          <li key={length}>
            <label htmlFor="input_image_button" id="add_image_button">
              Add image
            </label>
            <input id="input_image_button" type="file" name="post_pic" accept="image/*" onChange={this.readImageFile}></input>
          </li>
        )
      }
      return (
        <div id="white_background_wrapper">
          {this.state.imagePreviewUrls.length > 0 ?
            <div id="upload_images_wrapper">
              <div id="edit_image_wrapper">
                <img alt="" src={this.state.imagePreviewUrls[this.state.currentImageIndex]}></img>
              </div>
              <div id="image_list_wrapper">
                <ul id="upload_image_list">
                  {renderedList}
                </ul>
                <button className="continue_button" onClick={this.setContinue}>Continue</button>
              </div>
            </div>
            :
            <div id="input_box">
              <p id="input_box_title">Upload to this website</p>
              <div id="image_upload_wrapper">
                <label htmlFor="input_image_button" id="image_upload_label">
                  Upload an image/images
                </label>
                <input id="input_image_button" type="file" name="post_pic" accept="image/*" onChange={this.readImageFile} multiple></input>
              </div>
            </div>
          }
        </div>
      )
    }
  }
}
