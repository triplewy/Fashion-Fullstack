import React from 'react';
import shirt from 'images/shirt-icon.png'
import jacket from 'images/jacket-icon.png'
import shorts from 'images/shorts-icon.png'
import shoes from 'images/shoes-icon.png'

export default class InputTag extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show_tag_input_box: false,
      itemType: 'shirt',
      itemBrand: '',
      itemName: '',
      original: 0,
      input_tags: [],
    };
    this.showInputBox = this.showInputBox.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.saveTag = this.saveTag.bind(this);
    this.cancelInputTag = this.cancelInputTag.bind(this);
    this.editTag = this.editTag.bind(this);
    this.deleteTag = this.deleteTag.bind(this);
    this.renderClothingIcon = this.renderClothingIcon.bind(this);
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

  showInputBox() {
    this.setState({
      show_tag_input_box: true,
    });
  }

  saveTag() {
    var temp_input_tags = this.state.input_tags;
    temp_input_tags.push({
      itemType: this.state.itemType,
      itemBrand: this.state.itemBrand,
      itemName: this.state.itemName,
      original: this.state.original
    });

    this.props.getTags(temp_input_tags);

    this.setState({
      input_tags: temp_input_tags,
      itemType: '',
      itemBrand: '',
      itemName: '',
      original: false,
      show_tag_input_box: false
    });

  }

  cancelInputTag() {
    this.setState({
      show_tag_input_box: false
    });
  }

  editTag(e) {
    // var temp_input_tags = this.state.input_tags;
    // var edit_tag = temp_input_tags[e.target.id];
  }

  deleteTag(e) {
    var temp_input_tags = this.state.input_tags;
    temp_input_tags.splice(e.target.id,1);
    this.setState({
      input_tags: temp_input_tags
    })
  }

  handleChange(e) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      [e.target.name]: value
    });
  }

  render() {
    var input_tags = this.state.input_tags;
    var rendered_tags = [];
    if (input_tags != null) {
      rendered_tags = input_tags.map((item, index) => {
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
          <p className="form_input_text" id="tags_input"><span>Tags</span></p>
          <div id="input_tag_header_div">
            <button id="add_tag_button" type="button" onClick={this.showInputBox}>Add Tag</button>
            {this.state.show_tag_input_box ?
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
            </div> : null}
          </div>
          <div id="upload_tags_div">
            {rendered_tags}
          </div>
        </div>
  );
  }
}
