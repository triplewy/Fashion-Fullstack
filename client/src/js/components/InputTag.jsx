import React from 'react';

export default class InputTag extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemType: 'shirt',
      itemBrand: '',
      itemName: '',
      original: false,
      index: -1
    }

    this.handleChange = this.handleChange.bind(this);
    this.saveTag = this.saveTag.bind(this);
    this.cancelTag = this.cancelTag.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      itemType: nextProps.tag.itemType,
      itemBrand: nextProps.tag.itemBrand,
      itemName: nextProps.tag.itemName,
      original: nextProps.tag.original,
      index: nextProps.tag.index,
    });
  }

  cancelTag(e) {
    this.props.handleTagCancel();
    this.setState({itemType: 'shirt', itemBrand: '', itemName: '', original: false});
  }

  handleChange(e) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      [e.target.name]: value
    });
  }

  saveTag(e) {
    this.props.handleTagSave(this.state.itemType, this.state.itemBrand, this.state.itemName, this.state.original);
    this.setState({itemType: 'shirt', itemBrand: '', itemName: '', original: false, index: -1});
  }

  render() {
      return (
        <div id="tags_input_box" style={{'left': this.props.left, 'top': this.props.top,
          'display': this.props.display}}>
          <div id="input_tag_div">
            <p className="form_tags_input_text" id="tag_brand_input">Clothing Item:</p>
            <select id="item_dropdown" name="itemType"
              value={this.state.itemType} onChange={this.handleChange}>
              <option value="shirt">shirt</option>
              <option value="shorts">shorts</option>
              <option value="shoes">shoes</option>
              <option value="jacket">jacket</option>
              <option value="jacket">sweater</option>
              <option value="jacket">pants</option>
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
            <button id="form_cancel" type="button" onClick={this.cancelTag}>Cancel</button>
            <button id="save_tag_button" type="button"
              onClick={this.saveTag}>Save</button>
          </div>
        </div>
      );
  }
}
