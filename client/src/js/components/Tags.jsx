import React from 'react';
import shirt from 'images/shirt-icon.png'
import jacket from 'images/jacket-icon.png'
import shorts from 'images/shorts-icon.png'
import shoes from 'images/shoes-icon.png'
import link_icon from 'images/link-icon.png'
import trash_icon from 'images/trash-icon.png'
import edit_icon from 'images/edit-icon.svg'
import { Link } from 'react-router-dom'

export default class Tags extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayTagLocation: -1,
      displayClickTagLocation: -2,
      selectedTagIndex: -1
    };

    this.renderClothingIcon = this.renderClothingIcon.bind(this);
    this.showTagLocation = this.showTagLocation.bind(this)
    this.showClickTagLocation = this.showClickTagLocation.bind(this)
    this.clickLink = this.clickLink.bind(this)
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

  showTagLocation(index) {
    if (this.state.displayClickTagLocation !== index) {
      this.setState({displayTagLocation: index})
    }
  }

  showClickTagLocation(index) {
    if (this.state.displayClickTagLocation === index) {
      this.setState({displayClickTagLocation: -2, selectedTagIndex: index})
    } else {
      this.setState({displayClickTagLocation: index, selectedTagIndex: index})
    }
  }

  setCarouselIndex(index, imageIndex) {
    this.setState({selectedTagIndex: index})
    this.props.setCarouselIndex(imageIndex)
  }

  clickLink() {
    fetch('/api/linkClick', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.mediaId,
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    var renderedTags = [];
    if (this.props.tags) {
      console.log(this.props.tags);
      renderedTags = this.props.tags.map((item, index) => {
          return (
            <li key={index} className={(this.state.selectedTagIndex === index && this.props.carouselIndex === item.imageIndex) ? "active" : ""}>
              {/* <div id="tag_location" style={{'left': item.x, 'top': item.y,
                'display': this.state.displayTagLocation === index ? 'block' : 'none'}}>
              </div>
              <div id="click_tag_location" style={{'left': item.x, 'top': item.y,
                'display': this.state.displayClickTagLocation === index ? 'block' : 'none'}}>
                  <div id="inner_circle"></div>
              </div> */}
              <div className="tag_image" alt="clothing item"
                style={{backgroundImage: 'url(' + this.renderClothingIcon(item.itemType) + ')'}} />
              <div className="tags_text_div" onClick={this.setCarouselIndex.bind(this, index, item.imageIndex)}>
                <p className="tag_brand">{item.itemBrand}</p>
                <p className="tag_name">{item.itemName}</p>
              </div>
              {item.itemLink &&
              <div className="tag_link_wrapper">
                <div className="tag_link" style={{backgroundImage: 'url(' + link_icon + ')'}}/>
                <div className="dropdown">
                  <a className="dropdown_text" href={"http://" + item.itemLink} target="_blank" onClick={this.clickLink}>{item.itemLink}</a>
                </div>
              </div>
              }
              <div id="og_tag">
                {item.original ? <span>✔</span> : null}
              </div>
              {this.props.modify && <div id="tag_modifiers_div">
                <button className="tag_modifier_button" id="edit_tag_button" type="button" onClick={this.props.handleTagEdit.bind(this, index)}>
                  <img className="tag_modifier_button_image" src={edit_icon} alt="edit icon"></img>
                </button>
                <button className="tag_modifier_button" id="delete_tag_button" type="button" onClick={this.props.handleTagDelete.bind(this, index)}>
                  <img className="tag_modifier_button_image" src={trash_icon} alt="delete icon"></img>
                </button>
              </div>}
            </li>
          )
      });
    }

    return (
      <ul id="upload_tags_div">
        {renderedTags}
      </ul>
    );
  }
}
