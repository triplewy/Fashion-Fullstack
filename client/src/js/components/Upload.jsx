import React from 'react';
import Navbar from './Navbar.jsx'
import InputTag from './InputTag.jsx';
import {Dropdown} from 'react-bootstrap'
import shirt from 'images/shirt-icon.png'
import jacket from 'images/jacket-icon.png'
import shorts from 'images/shorts-icon.png'
import shoes from 'images/shoes-icon.png'
import * as loadImage from 'blueimp-load-image'
import Cookies from 'js-cookie';


export default class Upload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      file: this.props.location.state,
      imagePreviewUrl: '',
      title: '',
      genre: '',
      description: '',
      orientation: null,
      dateTime: '',
      inputTags: [],
      original: 0,
      currentTagScreenX: 0,
      currentTagScreenY: 0,
      currentTagRelativeX: 0,
      currentTagRelativeY: 0,
      displayTagInput: 'none',
      imageUploaded: false,
      inputTags: [],
      userId: Cookies.get('user')
    };

    this.readImageFile = this.readImageFile.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this)
    this.handleTagSave = this.handleTagSave.bind(this)
    this.handleTagCancel = this.handleTagCancel.bind(this)
    this.renderClothingIcon = this.renderClothingIcon.bind(this);
  }

  componentDidMount() {
    if (this.state.file) {
      var reader = new FileReader();
      var file = this.state.file[0];

      reader.onloadend = () => {
        this.setState({imagePreviewUrl: reader.result, imageUploaded: true});
      }
      reader.readAsDataURL(file);
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
    console.log("submit inputTags are", this.state.inputTags);
    console.log("cookie userId is", this.state.userId);
    console.log("orientation is", this.state.orientation);

    var formData = new FormData();
    formData.append('image', this.state.file);
    formData.append('title', this.state.title);
    formData.append('genre', this.state.genre);
    formData.append('description', this.state.description);
    formData.append('original', this.state.original);
    formData.append('userId', 1);
    formData.append('inputTags', JSON.stringify(this.state.inputTags));

    fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
    })
  }

  readImageFile(e) {
    e.preventDefault();
    var file = e.target.files[0];

    const loadImageOptions = { maxWidth: 850 }
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
          orientation: loadImageOptions.orientation,
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
    var tempInputTags = this.state.inputTags;
    tempInputTags.push({itemType: itemType, itemBrand: itemBrand, itemName: itemName,
      original: original, x: this.state.currentTagRelativeX, y: this.state.currentTagRelativeY})
    this.setState({inputTags: tempInputTags, displayTagInput: 'none'})
  }

  handleTagCancel(e) {
    this.setState({displayTagInput: 'none'})
  }

  renderClothingIcon(itemType) {
    switch(itemType) {
      case 'shirt':
        return shirt;
      case 'jacket':
        return jacket;
      case 'shorts':
        return shorts;
      case 'shoes':
        return shoes;
      default:
        return null;
      }
    }

  render() {

    var renderedTags = [];
    if (this.state.inputTags != null) {
      renderedTags = this.state.inputTags.map((item, index) => {
          return (
            <div key={index} className="clothing_tag" id={item.itemType + "_tag"}>
              <div id="outer_circle">
                <div id="inner_circle">
                </div>
              </div>
              <img className="tag_image" alt="clothing item" src={this.renderClothingIcon(item.itemType)}></img>
                <div className="tags_text_div">
                  <p className="tag_brand">{item.itemBrand}</p>
                  <p className="tag_name">{item.itemName}</p>
                  {item.original ? <div className="og_tag">
                    <img className="og_icon" alt="original icon" src="../images/og-icon.png"></img>
                  </div> : ''}
                </div>
                <div id="tag_modifiers_div">
                  <button className="tag_modifier_button" id="edit_tag_button" type="button" onClick={this.editTag}>Edit</button>
                  <button className="tag_modifier_button" id="delete_tag_button" type="button" onClick={this.deleteTag}>Delete</button>
                </div>
            </div>
          )
      });
    }

      return (
        <div>
        <Navbar />
        <InputTag left={this.state.currentTagScreenX} top={this.state.currentTagScreenY}
          display={this.state.displayTagInput} handleTagSave={this.handleTagSave} handleTagCancel={this.handleTagCancel}/>
        <div id="white_background_wrapper">
          {this.state.imageUploaded ?
          <div>
            <div id="single_post_polaroid_div">
              <div id="tag_click_div_wrapper">
                <div id="tag_click_div" onClick={this.handleClick}>
                  <div id="single_post_image_wrapper">
                        <img id="single_post_image" alt="" src={this.state.imagePreviewUrl}></img>
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
                  <div id="upload_tags_div">
                    {renderedTags}
                  </div>
                  <hr id="input_hr"></hr>
                  <label htmlFor="input_image_button" id="image_upload_label">
                    Change image
                  </label>
                  <input id="input_image_button" type="file" name="post_pic" accept="image/*"
                    onChange={this.readImageFile}></input>
                  <input id="form_submit" type="button" onClick={this.handleSubmit} value="Submit"></input>
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
