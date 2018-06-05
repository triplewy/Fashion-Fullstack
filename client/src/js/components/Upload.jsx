import React from 'react';
import Navbar from './Navbar.jsx'
import InputTags from './InputTags.jsx';


export default class Upload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      file: '',
      imagePreviewUrl: '',
      title: '',
      genre: '',
      description: '',
      dateTime: '',
      inputTags: [],
      original: 0
    };

    this.getTags = this.getTags.bind(this);
    this.readImageFile = this.readImageFile.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
    // for (var i = 0; i < this.state.inputTags.length; i++) {
    //   formData.append('inputTags[]', this.state.inputTags[i]);
    // }
    formData.append('inputTags', JSON.stringify(this.state.inputTags));

    fetch('/api/upload', {
      method: 'POST',
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
        imagePreviewUrl: reader.result
      });
    }
    reader.readAsDataURL(file);
  }

  render() {
    // var imagePreview = null;
    //   if (this.state.imagePreviewUrl) {
    //     imagePreview = (<img src={this.state.imagePreviewUrl}></img>);
    //   } else {
    //     imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
    //   }

      return (
        <div>
        <Navbar />
        <div id="white_background_wrapper">
          <div id="single_post_polaroid_div">
            <input id="input_image_button" type="file" name="post_pic" accept="image/*"
              onChange={this.readImageFile}></input>
            <div id="single_post_image_wrapper">
                  <img id="single_post_image" alt="" src={this.state.imagePreviewUrl}></img>
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
                <InputTags getTags={this.getTags}/>
                <hr id="input_hr"></hr>
                <input id="form_submit" type="button" onClick={this.handleSubmit} value="Submit"></input>
              </form>

            </div>

            </div>
          </div>
  );
  }
}
