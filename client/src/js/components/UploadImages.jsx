import React from 'react';
import UploadMetadata from './UploadMetadata.jsx'
import { setAspectRatio, setAspectRatioImageList } from './aspectRatio.js'
import * as loadImage from 'blueimp-load-image'
import close_icon from 'images/close-icon.png'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default class UploadImages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: this.props.files ? this.props.files : [],
      dimensions: this.props.dimensions ? this.props.dimensions : [],
      currentImageIndex: 0,
      continue: false,
      editToolIndex: null,
      resizeValue: 1,
      dragging: false,
      startPosition: {x: 0, y: 0},
      shift: {x: 0, y: 0}
    };

    this.readImageFiles = this.readImageFiles.bind(this);
    this.previewImages = this.previewImages.bind(this)
    this.imageProcessor = this.imageProcessor.bind(this)
    this.setCurrentImageIndex = this.setCurrentImageIndex.bind(this)
    this.removeImage = this.removeImage.bind(this)
    this.setContinue = this.setContinue.bind(this)
    this.setToolIndex = this.setToolIndex.bind(this)
    this.handleResizeChange = this.handleResizeChange.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.getBetween = this.getBetween.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this);
    this.reorder = this.reorder.bind(this)
  }

  readImageFiles(e) {
    e.preventDefault();
    if (e.target.files.length + this.state.files.length > 5) {
      alert("You can only upload a maximum of 5 files");
    } else {
      this.previewImages(e.target.files)
    }
  }

  async previewImages(files) {
    for (var i = 0; i < files.length; i ++) {
      await this.imageProcessor(files[i], this.state.files.length + i)
    }
  }

  imageProcessor(file, index) {
    var reader = new FileReader();
    reader.onloadend = () => {
      var img = new Image();
        img.onload = () => {
          var [width, height] = setAspectRatio(img.width, img.height)
          var tempDimensions = this.state.dimensions
          tempDimensions[index] = {original: {width: img.width, height: img.height}, display: {width: width, height: height}}
          this.setState({dimensions: tempDimensions})
        };
      img.src = reader.result;
    }
    reader.readAsDataURL(file);
    const loadImageOptions = { canvas: true }
    loadImage.parseMetaData(file, (data) => {
      if (data.exif) {
        loadImageOptions.orientation = data.exif.get('Orientation')
      }
      loadImage(file, (canvas) => {
        file.preview = canvas.toDataURL(file.type)
        var files = this.state.files
        files[index] = {file: file, preview: file.preview}
        this.setState({files: files})
      }, loadImageOptions)
    })
  }

  setCurrentImageIndex(index) {
    if (this.state.currentImageIndex !== index) {
      this.setState({currentImageIndex: index})
    }
  }

  removeImage(index, e) {
    e.stopPropagation()
    var files = this.state.files
    var dimensions = this.state.dimensions
    files.splice(index, 1)
    dimensions.splice(index, 1)
    if (this.state.currentImageIndex !== 0 && this.state.currentImageIndex >= index) {
      this.setState({files: files, dimensions: dimensions, currentImageIndex: this.state.currentImageIndex - 1})
    } else {
      this.setState({files: files, dimensions: dimensions})
    }
  }

  addImage(e) {
    this.previewImages(e.target.files, this.state.files.length)
  }

  setContinue(e) {
    if (!this.state.continue) {
      this.setState({continue: true})
    } else {
      this.setState({continue: false})
    }
  }

  setToolIndex(index) {
    this.setState({editToolIndex: index})
  }

  handleResizeChange(e) {
    var value = (e.target.value * 1)
    var aspectRatio = this.state.width/this.state.height
    var resizeHeight = this.state.displayHeight + value
    var resizeWidth = this.state.displayWidth + (value * aspectRatio)
    this.setState({resizeValue: value, backgroundImageWidth: resizeWidth, backgroundImageHeight: resizeHeight})
  }

  handleMouseDown(e) {
    console.log("drag down");
    this.setState({dragging: true, startPosition: {x: e.pageX, y: e.pageY}})
  }

  handleMouseUp(e) {
    console.log("drag up");
    this.setState({dragging: false})
  }

  handleMouseMove(e) {
    if (this.state.dragging) {
      var deltaY = e.pageY - this.state.startPosition.y
      var cushionY = this.state.backgroundImageHeight - this.state.displayHeight
      console.log("deltaY is", deltaY);
      this.setState({shift: {y: this.getBetween(Math.min(0, this.state.shift.y + deltaY), cushionY)}})
    }
  }

  getBetween(shift, cushion) {
    if (shift > -cushion) {
      return shift
    } else {
      return -cushion
    }
  }

  reorder(startIndex, endIndex) {
    const files = this.state.files;
    const dimensions = this.state.dimensions
    const [removedFiles] = files.splice(startIndex, 1);
    const [removedDimensions] = dimensions.splice(startIndex, 1)
    files.splice(endIndex, 0, removedFiles);
    dimensions.splice(endIndex, 0, removedDimensions)
    this.setState({files: files, dimensions: dimensions, currentImageIndex: endIndex})
  }

  onDragEnd(result) {
    if (result.destination) {
      this.reorder(result.source.index, result.destination.index)
    }
  }

  render() {
    if (this.state.continue) {
      return (
        <UploadMetadata files={this.state.files} dimensions={this.state.dimensions} />
      )
    } else {
      var renderedList = [];
      var length = this.state.files.length
      if (length > 0) {
        renderedList = this.state.files.map((item, index) => {
          if (this.state.dimensions[index]) {
            var [width, height] = setAspectRatioImageList(this.state.dimensions[index].original.width, this.state.dimensions[index].original.height)
            return (
              <Draggable key={index} draggableId={index} index={index}>
                {(provided, snapshot) => (
                  <div
                    className="upload_image_list_item"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={this.setCurrentImageIndex.bind(this, index)}
                  >
                    <div style={{backgroundImage: 'url(' + this.state.files[index].preview + ')',
                      backgroundSize: (width + "px " + height + "px"), width: width, height: height,
                      position: "relative"}}>
                      <button className="remove_image_button" onClick={this.removeImage.bind(this, index)}
                        style={{backgroundImage: 'url(' + close_icon + ')'}}></button>
                    </div>
                  </div>
                )}
              </Draggable>
            )
          }
        })
        renderedList.push(
          <div>
            <input id="input_image_button" type="file" name="post_pic" accept="image/*" multiple
            onChange={this.readImageFiles} disabled={(this.state.files.length > 4) ? "disabled" : ""}></input>
            <label htmlFor="input_image_button" id="add_image_button">Add image</label>
          </div>
        )
      }
      var renderedEditTool = null;
      if (this.state.editToolIndex === 0) {
        renderedEditTool = (
          <div className="slidecontainer">
            <input type="range" min="1" max="300" value={this.state.resizeValue} onChange={this.handleResizeChange}></input>
          </div>
        )
      }

      if (this.state.files.length > 0) {
        var index = this.state.currentImageIndex
        console.log("currentImageIndex is", index);
        console.log("dimensions are", this.state.dimensions);
        console.log("files are", this.state.files);
        console.log("renderedList is", renderedList);
        var file = this.state.files[index]
        var dimensions = this.state.dimensions[index]
        return (
          <div id="white_background_wrapper">
            <p id="upload_title">Upload</p>
            <div id="upload_images_wrapper">
              <div id="edit_image_wrapper">
                {renderedEditTool}
                {(dimensions && file) &&
                  <div className="post_image" style={{backgroundImage: 'url(' + file.preview + ')',
                    backgroundSize: (dimensions.display.width + "px " + dimensions.display.height + "px"),
                    width: dimensions.display.width, height: dimensions.display.height,
                    cursor: "move", backgroundPosition: (this.state.shift.x + "px " + this.state.shift.y + "px")}}
                    onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp} onMouseMove={this.handleMouseMove}/>
                  }
              </div>
              <div id="edit_tools_wrapper">
                <ul id="edit_tools">
                  <li onClick={this.setToolIndex.bind(this, 0)} className={this.state.editToolIndex === 0 ? "active" : ""}>
                    Resize
                  </li>
                  <li onClick={this.setToolIndex.bind(this, 1)} className={this.state.editToolIndex === 1 ? "active" : ""}>
                    Crop
                  </li>
                  <li onClick={this.setToolIndex.bind(this, 2)} className={this.state.editToolIndex === 2 ? "active" : ""}>
                    Brightness
                  </li>
                </ul>
              </div>
              <div id="image_list_wrapper">
                <DragDropContext onDragEnd={this.onDragEnd}>
                  <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                      <div
                        id="upload_image_list"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {renderedList}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <button className="continue_button" onClick={this.setContinue}>Continue</button>
              </div>
            </div>
          </div>
        )
      } else {
        return (
          <div id="white_background_wrapper">
            <div id="input_box">
              <p id="input_box_title">Upload to this website</p>
              <div id="image_upload_wrapper">
                <label htmlFor="input_image_button" id="image_upload_label">
                  Upload an image/images
                </label>
                <input id="input_image_button" type="file" name="post_pic" accept="image/*" onChange={this.readImageFiles} multiple></input>
              </div>
            </div>
          </div>
        )
      }
    }
  }
}
