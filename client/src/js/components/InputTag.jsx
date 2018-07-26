import React from 'react';
import memoize from 'memoize-one'


export default class InputTag extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemType: 'shirt',
      itemBrand: '',
      itemName: '',
      original: 0,
    };

    this.changeDisplay = this.changeDisplay.bind(this);
    this.showInputBox = this.showInputBox.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.saveTag = this.saveTag.bind(this);
    this.cancelTag = this.cancelTag.bind(this);
    this.editTag = this.editTag.bind(this);
    this.deleteTag = this.deleteTag.bind(this);
  }

  componentDidMount() {
    console.log(this.state.display);
  }

  changeDisplay = memoize((display) => {
      this.setState({display: display})
  })

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

  cancelTag(e) {
    this.props.handleTagCancel();
    this.setState({itemType: '', itemBrand: '', itemName: '', original: false});
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

  saveTag(e) {
    this.props.handleTagSave(this.state.itemType, this.state.itemBrand, this.state.itemName, this.state.original);
    this.setState({itemType: '', itemBrand: '', itemName: '', original: false});
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
