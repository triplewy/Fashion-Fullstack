import React from 'react';
import InputTag from './InputTag.jsx';
import Tags from './Tags.jsx'
import CarouselImages from './CarouselImages.jsx'
import UploadImages from './UploadImages.jsx'
import { Carousel } from 'react-bootstrap'

export default class UploadMetadata extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
      carouselIndex: 0,
      back: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this)
    this.handleTagSave = this.handleTagSave.bind(this)
    this.handleTagCancel = this.handleTagCancel.bind(this)
    this.handleTagDelete = this.handleTagDelete.bind(this)
    this.handleTagEdit = this.handleTagEdit.bind(this)
    this.subtractCarouselIndex = this.subtractCarouselIndex.bind(this)
    this.addCarouselIndex = this.addCarouselIndex.bind(this)
    this.goBack = this.goBack.bind(this)
  }

  componentDidMount() {
    console.log("files are", this.props.files);
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
    console.log("files are", this.props.files);
    for (var i = 0; i < this.props.files.length; i++) {
      formData.append('image', this.props.files[i].file, this.props.files[i].file.name)
    }
    formData.append('title', this.state.title);
    formData.append('genre', this.state.genre);
    formData.append('description', this.state.description);
    formData.append('original', original);
    formData.append('inputTags', JSON.stringify(this.state.inputTags));
    formData.append('dimensions', JSON.stringify(this.props.dimensions))


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

  render() {
    var renderedCarousel = [];
    var renderedCarouslIndicators = []
    var length = this.props.files.length
    if (length > 0) {
      for (var i = 0; i < this.props.files.length; i++) {
        var width = this.props.dimensions[i].display.width
        var height = this.props.dimensions[i].display.height
        renderedCarousel.push(
          <div className={i === this.state.carouselIndex ? "item active" : "item"} key={i}>
            <div className="post_image" style={{backgroundImage: 'url(' + this.props.files[i].preview + ')',
              backgroundSize: (width + "px " + height + "px"), width: width, height: height}} />
          </div>
        )
        renderedCarouslIndicators.push(
          <li key={i} className={i === this.state.carouselIndex ? "active" : ""}></li>
        )
      }
    }
    if (this.state.back) {
      return (
        <UploadImages files={this.props.files} dimensions={this.props.dimensions}/>
      )
    } else {
      return (
        <div>
          <InputTag left={this.state.currentTagScreenX} top={this.state.currentTagScreenY}
            display={this.state.displayTagInput} handleTagSave={this.handleTagSave} handleTagCancel={this.handleTagCancel}
            index={this.state.editTagIndex} tag={this.state.editTag}/>
          <div id="white_background_wrapper">
            <p id="upload_title">Upload</p>
            <div id="upload_images_wrapper">
              <div id="single_post_polaroid_div">
                <div id="tag_click_div_wrapper">
                  <div id="tag_click_div" onClick={this.handleClick}>
                    <div id="post_wrapper">
                    {this.props.files.length === 1 ?
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
                         <a className="carousel-control left" role="button" href="#">
                           <span className="glyphicon glyphicon-chevron-left" onClick={this.subtractCarouselIndex}>
                           </span>
                           <span className="sr-only">Previous</span>
                         </a>
                         <a className="carousel-control right" role="button" href="#">
                           <span className="glyphicon glyphicon-chevron-right" onClick={this.addCarouselIndex}>
                           </span>
                           <span className="sr-only">Next</span>
                         </a>
                      </div>
                    }
                  </div>

                  </div>
                </div>

                </div>
                <div id="input_div">
                  <button id="back_button" onClick={this.goBack}>Back</button>
                  <p className="form_input_text" id="tags_input"><span>Post</span></p>
                  <input type="text" autoComplete="off" placeholder="Title"
                    name="title" onChange={this.handleChange} value={this.state.title}></input>
                  <input type="text" autoComplete="off" placeholder="Genre"
                    name="genre" onChange={this.handleChange} value={this.state.genre}></input>
                  <textarea type="text" autoComplete="off" placeholder="Description"
                    name="description" onChange={this.handleChange} value={this.state.description}></textarea>
                  <p className="form_input_text" id="tags_input"><span>Tags</span></p>
                  <Tags tags={this.state.inputTags} modify={true} handleTagDelete={this.handleTagDelete}
                    handleTagEdit={this.handleTagEdit}/>
                  <input id="form_submit" type="button" onClick={this.handleSubmit} value="Submit" disabled={!this.state.title}></input>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}
