import React from 'react';

export default class InputTag extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      topBrands: [],
      itemType: 'shirt',
      itemBrand: '',
      itemName: '',
      itemLink: '',
      original: false,
      index: -1
    }

    this.handleChange = this.handleChange.bind(this);
    this.saveTag = this.saveTag.bind(this);
    this.cancelTag = this.cancelTag.bind(this);
  }

  componentDidMount() {
    fetch('/api/topBrands', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({topBrands: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.tag !== prevProps.tag) {
      this.setState({
        itemType: this.props.tag.itemType,
        itemBrand: this.props.tag.itemBrand,
        itemName: this.props.tag.itemName,
        original: this.props.tag.original,
        link: this.props.tag.link,
        index: this.props.tag.index,
      });
    }
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
    this.props.handleTagSave(this.state.itemType, this.state.itemBrand, this.state.itemName, this.state.itemLink, this.state.original);
    this.setState({itemType: 'shirt', itemBrand: '', itemName: '', original: false, index: -1});
  }

  render() {
      return (
        <div id="tags_input_box" style={{'left': this.props.left, 'top': this.props.top, 'display': this.props.display}}>
          <div id="input_tag_div">
            <div id="input_tag_position"/>
            <div>
              <p id="tag_type_input">Type</p>
              <input name="original" type="checkbox" checked={this.state.original} onChange={this.handleChange}></input>
              <p id="tag_original_input">Original</p>
            </div>
            <select name="itemType" value={this.state.itemType} onChange={this.handleChange}>
              <option value="shirt">Shirt</option>
              <option value="shorts">Shorts</option>
              <option value="shoes">Shoes</option>
              <option value="jacket">Jacket</option>
              <option value="sweater">Sweater</option>
              <option value="pants">Pants</option>
            </select>
            <p id="tag_brand_input">Brand</p>
            <input type="text" name="itemBrand" value={this.state.itemBrand} onChange={this.handleChange}></input>
            <p id="tag_name_input">Name</p>
            <input type="text" name="itemName" value={this.state.itemName} onChange={this.handleChange}></input>
            <p id="tag_name_input">Link</p>
            <input type="text" name="itemLink" value={this.state.itemLink} onChange={this.handleChange}></input>
            <button id="form_cancel" type="button" onClick={this.cancelTag}>Cancel</button>
            <button id="save_tag_button" type="button" onClick={this.saveTag}>Save</button>
          </div>
        </div>
      );
  }
}
