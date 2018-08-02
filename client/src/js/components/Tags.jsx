// Create a new React component here!import React from 'react';
import React from 'react';
import shirt from 'images/shirt-icon.png'
import jacket from 'images/jacket-icon.png'
import shorts from 'images/shorts-icon.png'
import shoes from 'images/shoes-icon.png'
import trash_icon from 'images/trash-icon.png'
import edit_icon from 'images/edit-icon.svg'

// {this.props.modify && <div id="outer_circle">
//   <div id="inner_circle"></div>
// </div>}

export default class Tags extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: this.props.tags,
      displayTagLocation: -1,
      displayClickTagLocation: -2
    };

    this.renderClothingIcon = this.renderClothingIcon.bind(this);
    this.showTagLocation = this.showTagLocation.bind(this)
    this.showClickTagLocation = this.showClickTagLocation.bind(this)
    this.handleTagDelete = this.handleTagDelete.bind(this)

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
    if (this.state.displayClickTagLocation != index) {
      this.setState({displayTagLocation: index})
    }
  }

  showClickTagLocation(index) {
    if (this.state.displayClickTagLocation == index) {
      this.setState({displayClickTagLocation: -2})
    } else {
      this.setState({displayClickTagLocation: index})
    }
  }

  handleTagDelete(index) {
    var tempArray = this.state.tags
    tempArray.splice(index, 1)
    this.setState({tags: tempArray})
  }

  render() {
    var renderedTags = [];
    if (this.state.tags != null) {
      renderedTags = this.state.tags.map((item, index) => {
          return (
            <li key={index} className="clothing_tag" id={item.itemType + "_tag"} onMouseEnter={this.showTagLocation.bind(this, index)}
              onMouseLeave={this.showTagLocation.bind(this, -1)} onClick={this.showClickTagLocation.bind(this, index)}
              style={{'backgroundColor': this.state.displayClickTagLocation === index ? '#f1f1f1' : null}}>
              <div id="tag_location" style={{'left': item.x, 'top': item.y,
                'display': this.state.displayTagLocation === index ? 'block' : 'none'}}>
              </div>
              <div id="click_tag_location" style={{'left': item.x, 'top': item.y,
                'display': this.state.displayClickTagLocation === index ? 'block' : 'none'}}>
                  <div id="inner_circle"></div>
              </div>
              <img className="tag_image" alt="clothing item" src={this.renderClothingIcon(item.itemType)}></img>
                <div className="tags_text_div">
                  <p className="tag_brand">{item.itemBrand}</p>
                  <p className="tag_name">{item.itemName}</p>
                </div>
                {this.props.modify && <div id="tag_modifiers_div">
                  <button className="tag_modifier_button" id="edit_tag_button" type="button" onClick={this.props.handleTagEdit.bind(this, index)}>
                    <img className="tag_modifier_button_image" src={edit_icon}></img>
                  </button>
                  <button className="tag_modifier_button" id="delete_tag_button" type="button" onClick={this.props.handleTagDelete.bind(this, index)}>
                    <img className="tag_modifier_button_image" src={trash_icon}></img>
                  </button>
                </div>}
                <div id="og_tag">
                  {item.original != 0 && <span>✔</span>}
                </div>
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
