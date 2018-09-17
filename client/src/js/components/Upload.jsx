import React from 'react';
import InputTag from './InputTag.jsx';
import Tags from './Tags.jsx'
import UploadImages from './UploadImages.jsx'
import { Carousel } from 'react-bootstrap'

export default class Upload extends React.Component {
  constructor(props) {
    super(props);
    console.log("props are", props);
    this.state = {
      file: this.props.location.state,
      files: [],
      title: '',
      genre: '',
      description: '',
      dateTime: '',
      inputTags: [],
      currentTagScreenX: 0,
      currentTagScreenY: 0,
      currentTagRelativeX: 0,
      currentTagRelativeY: 0,
      displayTagInput: 'none',
      editTagIndex: -1,
      editTag: {itemType:'shirt', itemBrand: '', itemName: '', original: false},
      continue: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this)
    this.handleTagSave = this.handleTagSave.bind(this)
    this.handleTagCancel = this.handleTagCancel.bind(this)
    this.handleTagDelete = this.handleTagDelete.bind(this)
    this.handleTagEdit = this.handleTagEdit.bind(this)
  }

  handleChange(e) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      [e.target.name]: value
    });
  }

  handleSubmit(e) {
    var original = 0
    for (var i = 0; i < this.state.inputTags.length; i++) {
      if (this.state.inputTags[i].original) {
        original = 1
        break;
      }
    }
    var formData = new FormData();
    formData.append('image', this.state.file);
    formData.append('title', this.state.title);
    formData.append('genre', this.state.genre);
    formData.append('description', this.state.description);
    formData.append('original', original);
    formData.append('inputTags', JSON.stringify(this.state.inputTags));

    fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    .then(response => {
      console.log(response);
      if (response.status === 400) {
        console.log("not logged in");
      } else {
        return response.json()
      }
    })
    .then(data => {
      console.log(data.message);
      if (data.message === 'success') {

      }
    })
  }

  handleClick(e) {
    console.log('x coordinate is', e.nativeEvent.offsetX);
    console.log('y coordinate is', e.nativeEvent.offsetY);

    this.setState({
      currentTagScreenX: e.pageX,
      currentTagScreenY: e.pageY,
      currentTagRelativeX: e.nativeEvent.offsetX,
      currentTagRelativeY: e.nativeEvent.offsetY,
      displayTagInput: 'block'
    })
  }

  handleTagSave(itemType, itemBrand, itemName, original) {
    var tempInputTags = this.state.inputTags
    var saveTag = {itemType: itemType, itemBrand: itemBrand, itemName: itemName,
      original: original, x: this.state.currentTagRelativeX, y: this.state.currentTagRelativeY,
      pageX: this.state.currentTagScreenX, pageY: this.state.currentTagScreenY}
    if (this.state.editTagIndex >= 0) {
      tempInputTags[this.state.editTagIndex] = saveTag
    } else {
      tempInputTags.push(saveTag)
    }
    this.setState({inputTags: tempInputTags,
      displayTagInput: 'none',
      editTag: {itemType:'shirt', itemBrand: '', itemName: '', original: false},
      editTagIndex: -1
    })
  }

  handleTagCancel(e) {
    this.setState({
      displayTagInput: 'none',
      editTag: {itemType:'shirt', itemBrand: '', itemName: '', original: false},
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
      currentTagScreenX: tag.pageX,
      currentTagScreenY: tag.pageY,
      currentTagRelativeX: tag.x,
      currentTagRelativeY: tag.y,
      displayTagInput: 'block',
      editTagIndex: index,
      editTag: tag
    })
  }

  setContinue(e) {
    if (!this.state.continue) {
      this.setState({continue: true})
    } else {
      this.setState({continue: false})
    }
  }

  render() {
    console.log("imagePreviewUrls are", this.state.imagePreviewUrls);
    if (this.state.continue) {
      return (
        <div>
          <InputTag left={this.state.currentTagScreenX} top={this.state.currentTagScreenY}
            display={this.state.displayTagInput} handleTagSave={this.handleTagSave} handleTagCancel={this.handleTagCancel}
            index={this.state.editTagIndex} tag={this.state.editTag}/>
          <div id="white_background_wrapper">
            <div id="single_post_polaroid_div">
              <div id="tag_click_div_wrapper">
                <div id="tag_click_div" onClick={this.handleClick}>
                  <div id="post_wrapper">
                  {this.state.imagePreviewUrl.length === 1 ?
                    <img id="post_image" alt="" src={this.state.imagePreviewUrls[0]}></img>
                    :
                    <Carousel>
                      <Carousel.Item>
                        <img id="post_image" alt="" src={this.state.imagePreviewUrls[0]}></img>
                      </Carousel.Item>
                      <Carousel.Item>
                        <img id="post_image" alt="" src={this.state.imagePreviewUrls[1]}></img>
                      </Carousel.Item>
                    </Carousel>
                  }
                </div>

                </div>
              </div>

              </div>
              <div id="input_div">
                <p className="form_input_text" id="tags_input"><span>Post Info</span></p>
                <input type="text" autoComplete="off" placeholder="Title"
                  name="title" onChange={this.handleChange} value={this.state.title}></input>
                <input type="text" autoComplete="off" placeholder="Genre"
                  name="genre" onChange={this.handleChange} value={this.state.genre}></input>
                <textarea type="text" autoComplete="off" placeholder="Description"
                  name="description" onChange={this.handleChange} value={this.state.description}></textarea>
                <p className="form_input_text" id="tags_input"><span>Tags</span></p>
                <div id="input_tag_header_div">
                  <button id="add_tag_button" type="button" onClick={this.showInputBox}>Add Tag</button>
                </div>
                <Tags tags={this.state.inputTags} modify={true} handleTagDelete={this.handleTagDelete}
                  handleTagEdit={this.handleTagEdit}/>
                <label htmlFor="input_image_button" id="image_upload_label">
                  Change image
                </label>
                <input id="input_image_button" type="file" name="post_pic" accept="image/*" onChange={this.readImageFile} multiple></input>
                <input id="form_submit" type="button" onClick={this.handleSubmit} value="Submit" disabled={!this.state.title}></input>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <UploadImages files={this.state.files} setContinue={this.setContinue}/>
      )
    }
  }
}
