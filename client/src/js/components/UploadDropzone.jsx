import React from 'react';
import UploadImages from './UploadImages.jsx'
import Dropzone from 'react-dropzone'
import {Modal} from 'react-bootstrap';
import shirt from 'images/shirt-icon.png'
import jacket from 'images/jacket-icon.png'
import shorts from 'images/shorts-icon.png'
import shoes from 'images/shoes-icon.png'

export default class UploadDropzone extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      dropzoneActive: false
    };

    this.readImageFiles = this.readImageFiles.bind(this)
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  readImageFiles(e) {
    e.preventDefault();
    if (e.target.files.length + this.state.files.length > 5) {
      alert("You can only upload a maximum of 5 files");
    } else {
      this.setState({files: Array.from(e.target.files)})
    }
  }

  onDragEnter() {
    console.log("we in here");
    this.setState({dropzoneActive: true});
  }

  onDragLeave() {
    console.log("we not in here");
    this.setState({dropzoneActive: false});
  }

  onDrop(accepted, rejected) {
    console.log("files dropped", accepted);
    if (accepted.length > 0) {
      if (accepted.length > 5) {
        this.setState({dropzoneActive: false})
        alert("You can only upload a maximum of 5 files");
      } else {
        this.setState({files: accepted, dropzoneActive: false});
      }
    } else {
      this.setState({dropzoneActive: false})
    }
  }

  render() {
    const files = this.state.files
    const dropzoneActive = this.state.dropzoneActive
    if (files.length > 0) {
      return (
        <UploadImages droppedFiles={files} user={this.props.user} />
      )
    } else {
      return (
        <div id="white_background_wrapper">
          <div id="input_box" style={{border: (dropzoneActive ? '2px solid #337ab7' : "2px solid #ccc")}}>
            <Dropzone
                disableClick
                accept={['image/jpg', 'image/png', 'image/jpeg']}
                style={{width: '100%', height: '100%'}}
                multiple={true}
                onDrop={this.onDrop}
                onDragEnter={this.onDragEnter}
                onDragLeave={this.onDragLeave}
            >
            <h1 id="input_box_title" style={{color: (dropzoneActive ? '#337ab7' : "#888888")}}>Upload your fit(s)</h1>
            <div className="input_box_icons">
              <div className={dropzoneActive ? "active" : ""} style={{backgroundImage: 'url(' + shorts + ')'}}></div>
              <div className={dropzoneActive ? "active" : ""} style={{backgroundImage: 'url(' + shirt + ')'}}></div>
              <div className={dropzoneActive ? "active" : ""} style={{backgroundImage: 'url(' + shoes + ')'}}></div>
            </div>
            <p>Drag your files here or</p>
            <label htmlFor="input_image_button" id="image_upload_label">
              browse
            </label>
            <input id="input_image_button" type="file" name="post_pic" accept="image/*" onChange={this.readImageFiles} multiple></input>
          </Dropzone>
          </div>
      </div>
      )
    }
  }
}
