import React from 'react';
import Navbar from './Navbar.jsx'
import InputTag from './InputTag.jsx';
import {Dropdown} from 'react-bootstrap'
import shirt from 'images/shirt-icon.png'
import jacket from 'images/jacket-icon.png'
import shorts from 'images/shorts-icon.png'
import shoes from 'images/shoes-icon.png'

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
      original: 0,
      currentTagScreenX: 0,
      currentTagScreenY: 0,
      currentTagRelativeX: 0,
      currentTagRelativeY: 0,
      displayTagInput: 'none',
      imageUploaded: false,
      inputTags: []
    };

    this.getTags = this.getTags.bind(this);
    this.readImageFile = this.readImageFile.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this)
    this.handleTagSave = this.handleTagSave.bind(this)
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

  getTags(val) {
    this.setState({inputTags: val});
  }

  handleChange(e) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      [e.target.name]: value
    });
  }

  handleSubmit(e) {
    console.log(this.state.inputTags);
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
    var reader = new FileReader();
    var file = e.target.files[0];

    reader.onloadend = () => {
      console.log(reader.result);
      console.log("file is", file);
      this.setState({
        file: file,
        imagePreviewUrl: reader.result,
        imageUploaded: true
      });
    }
    reader.readAsDataURL(file);
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

  handleTagSave(e) {

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
    // var imagePreview = null;
    //   if (this.state.imagePreviewUrl) {
    //     imagePreview = (<img src={this.state.imagePreviewUrl}></img>);
    //   } else {
    //     imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
    //   }

    var renderedTags = [];
    if (this.state.inputTags != null) {
      renderedTags = this.state.inputTags.map((item, index) => {
          return (
            <div key={index} className="clothing_tag" id={item.itemType + "_tag"}>
              <img className="tag_image" alt="clothing item" src={this.renderClothingIcon(item.itemType)}></img>
                <div className="tags_text_div">
                  <p className="tag_brand">{item.itemBrand}</p>
                  <p className="tag_name">{item.itemName}</p>
                  {item.original ? <div className="og_tag">
                    <img className="og_icon" alt="original icon" src="../images/og-icon.png"></img>
                  </div> : ''}
                  <button id="edit_tag_button" type="button" onClick={this.editTag}>Edit</button>
                  <button id="delete_tag_button" type="button" onClick={this.deleteTag}>Delete</button>
                </div>
            </div>
          )
      });
    }

      return (
        <div>
        <Navbar />
        <div id="tags_input_box" style={{'left': this.state.currentTagScreenX, 'top': this.state.currentTagScreenY, 'display': this.state.displayTagInput}}>
          <div id="input_tag_div">
            <p className="form_tags_input_text" id="tag_brand_input">Clothing Item:</p>
            <select id="item_dropdown" name="itemType"
              value={this.state.itemType} onChange={this.handleChange}>
              <option value="shirt">shirt</option>
              <option value="shorts">shorts</option>
              <option value="shoes">shoes</option>
              <option value="jacket">jacket</option>
            </select>
            <p className="form_tags_input_text" id="tag_brand_input">Clothing Brand:</p>
            <input className="input_box" type="text" name="itemBrand"
              value={this.state.itemBrand} onChange={this.handleChange}></input>
            <p className="form_tags_input_text" id="tag_name_input">Clothing Name:</p>
            <input className="input_box" type="text" name="itemName"
              value={this.state.itemName} onChange={this.handleChange}></input>
            <p className="form_tags_input_text" id="tag_original_input">Original:</p>
            <input name="original" type="checkbox" checked={this.state.original}
              onChange={this.handleChange}></input>
            <br />
            <button id="form_cancel" type="button" onClick={this.cancelInputTag}>Cancel</button>
            <button id="save_tag_button" type="button" onClick={this.saveTag}>Save</button>
          </div>
        </div>
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
                  <InputTag handleTagSave={this.handleTagSave}/>
                  <div id="upload_tags_div">
                    {renderedTags}
                  </div>
                  <hr id="input_hr"></hr>
                  <input id="form_submit" type="button" onClick={this.handleSubmit} value="Submit"></input>
                </form>
              </div>
          </div>
           :
          <div id="input_box">
            <p id="input_box_title">Upload to this website</p>
            <div id="image_upload_wrapper">
              <label for="input_image_button" id="image_upload_label">
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
