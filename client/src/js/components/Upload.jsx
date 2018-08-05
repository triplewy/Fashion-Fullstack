import React from 'react';
import InputTag from './InputTag.jsx';
import Tags from './Tags.jsx'
import * as loadImage from 'blueimp-load-image'

export default class Upload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      file: this.props.location.state,
      imagePreviewUrl: '',
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
      imageUploaded: false
    };

    this.readImageFile = this.readImageFile.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this)
    this.handleTagSave = this.handleTagSave.bind(this)
    this.handleTagCancel = this.handleTagCancel.bind(this)
    this.handleTagDelete = this.handleTagDelete.bind(this)
    this.handleTagEdit = this.handleTagEdit.bind(this)
  }

  componentDidMount() {
    if (this.state.file) {
      // var reader = new FileReader();
      var file = this.state.file[0];

      const loadImageOptions = { canvas: true, maxWidth: 850 }
      loadImage.parseMetaData(file, (data) => {
        if (data.exif) {
          loadImageOptions.orientation = data.exif.get('Orientation')
          console.log("loadImageOptions are", loadImageOptions);
        }
        loadImage(file, (canvas) => {
          console.log("file is", file);
          file.preview = canvas.toDataURL(file.type)
          this.setState({
            file: file,
            imagePreviewUrl: file.preview,
            imageUploaded: true
          })
        }, loadImageOptions)
      })


      //
      // reader.onloadend = () => {
      //   this.setState({imagePreviewUrl: reader.result, imageUploaded: true});
      // }
      // reader.readAsDataURL(file);
    } else {
      this.setState({imageUploaded: false})
    }
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
      if (response.status == 400) {
        console.log("not logged in");
      } else {
        return response.json()
      }
    })
    .then(data => {
      console.log(data.message);
      if (data.message == 'success') {

      }
    })
  }

  readImageFile(e) {
    e.preventDefault();
    var file = e.target.files[0];

    const loadImageOptions = { canvas: true, maxWidth: 850 }
    loadImage.parseMetaData(file, (data) => {
      if (data.exif) {
        loadImageOptions.orientation = data.exif.get('Orientation')
        console.log("loadImageOptions are", loadImageOptions);
      }
      loadImage(file, (canvas) => {
        console.log("file is", file);
        file.preview = canvas.toDataURL(file.type)
        this.setState({
          file: file,
          imagePreviewUrl: file.preview,
          imageUploaded: true
        })
      }, loadImageOptions)
    })

    // var reader = new FileReader();
    // reader.onloadend = () => {
    //   console.log(reader.result);
    //   console.log("file is", file);
    //   this.setState({
    //     file: file,
    //     imagePreviewUrl: reader.result,
    //     imageUploaded: true
    //   });
    // }
    // reader.readAsDataURL(file);
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

  render() {
    return (
      <div>
      <InputTag left={this.state.currentTagScreenX} top={this.state.currentTagScreenY}
        display={this.state.displayTagInput} handleTagSave={this.handleTagSave} handleTagCancel={this.handleTagCancel}
        index={this.state.editTagIndex} tag={this.state.editTag}/>
      <div id="white_background_wrapper">
        {this.state.imageUploaded ?
        <div>
          <div id="single_post_polaroid_div">
            <div id="tag_click_div_wrapper">
              <div id="tag_click_div" onClick={this.handleClick}>
                <div id="single_post_image_wrapper">
                      <img id="upload_post_image" alt="" src={this.state.imagePreviewUrl}></img>
                </div>
              </div>
            </div>

            </div>
            <div id="input_div">
              <form id="input_form">
                <p className="form_input_text" id="title_input">Title:</p>
                <input className="input_box" type="text" name="title"
                  onChange={this.handleChange} placeholder="Title of your post"
                  value={this.state.title}></input>
                <p className="form_input_text" id="genre_input">Genre:</p>
                <input className="input_box" type="text" name="genre"
                  onChange={this.handleChange} placeholder="Genre of your post"
                  value={this.state.genre}></input>
                <p className="form_input_text" id="description_input">Description:</p>
                <textarea className="input_box" id="description_input_box" name="description"
                  onChange={this.handleChange} placeholder="Description of your post" cols="10"
                  value={this.state.description}></textarea>
                <p className="form_input_text" id="tags_input"><span>Tags</span></p>
                <div id="input_tag_header_div">
                  <button id="add_tag_button" type="button" onClick={this.showInputBox}>Add Tag</button>
                </div>
                <Tags tags={this.state.inputTags} modify={true} handleTagDelete={this.handleTagDelete}
                  handleTagEdit={this.handleTagEdit}/>
                <hr id="input_hr"></hr>
                <label htmlFor="input_image_button" id="image_upload_label">
                  Change image
                </label>
                <input id="input_image_button" type="file" name="post_pic" accept="image/*"
                  onChange={this.readImageFile}></input>
                <input id="form_submit" type="button" onClick={this.handleSubmit} value="Submit" disabled={!this.state.title}></input>
              </form>
            </div>
        </div>
         :
        <div id="input_box">
          <p id="input_box_title">Upload to this website</p>
          <div id="image_upload_wrapper">
            <label htmlFor="input_image_button" id="image_upload_label">
              Upload an image
            </label>
            <input id="input_image_button" type="file" name="post_pic" accept="image/*"
              onChange={this.readImageFile}></input>
          </div>
        </div>
      }
      </div>
    </div>
    );
  }
}
