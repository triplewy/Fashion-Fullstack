import React from 'react';
import Autosuggest from 'react-autosuggest';
import { Overlay, Tooltip } from 'react-bootstrap'

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestions(value, list) {
  const escapedValue = escapeRegexCharacters(value.trim());
  if (escapedValue === '') {
    return [];
  }
  const regex = new RegExp('^' + escapedValue, 'i');
  return list.filter(item => regex.test(item.itemBrand));
}

function getSuggestionValue(suggestion) {
  return suggestion.itemBrand;
}

function renderSuggestion(suggestion) {
  return (
    <span>{suggestion.itemBrand}</span>
  );
}

export default class InputTag extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      topBrands: [],
      brandSuggestions: [],

      itemType: 'shirt',
      itemBrand: '',
      itemName: '',
      itemLink: '',
      original: false
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
        itemLink: this.props.tag.itemLink,
        original: this.props.tag.original
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
    this.props.handleTagSave(this.state.itemType, this.state.itemBrand, this.state.itemName, this.state.itemLink.replace(/^https?\:\/\//i, ""), this.state.original, e);
    this.setState({itemType: 'shirt', itemBrand: '', itemName: '', itemLink: '', original: false});
  }

  onChange = (event, { newValue, method }) => {
    this.setState({
      itemBrand: newValue
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
   this.setState({brandSuggestions: getSuggestions(value, this.state.topBrands)});
  };

  onSuggestionsClearRequested = () => {
   this.setState({brandSuggestions: []});
  };

  render() {
    const value = this.state.itemBrand
    const inputProps = {value, onChange: this.onChange}
      return (
        <div id="tags_input_box" style={{'left': this.props.left + '%', 'top': this.props.top + '%', 'display': this.props.display}}>
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
              <option value="cap">Cap</option>
              <option value="hat">Hat</option>
              <option value="eyewear">Eyewear</option>
              <option value="bag">Bag</option>
            </select>
            <p id="tag_brand_input">Brand</p>
            <Autosuggest
              suggestions={this.state.brandSuggestions}
              onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
              onSuggestionsClearRequested={this.onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              renderSuggestion={renderSuggestion}
              inputProps={inputProps}
            />
            {/* <input type="text" name="itemBrand" value={this.state.itemBrand} onChange={this.handleChange}></input> */}
            <p id="tag_name_input">Name</p>
            <input type="text" name="itemName" value={this.state.itemName} onChange={this.handleChange}></input>
            <p id="tag_name_input">Link</p>
            <input type="text" name="itemLink" value={this.state.itemLink} onChange={this.handleChange}></input>
            <button id="form_cancel" type="button" onClick={this.cancelTag}>Cancel</button>
            <button id="save_tag_button" type="button" onClick={this.saveTag}>Save</button>
            <Overlay
              show={this.props.showOverlay}
              container={this}
              placement="right"
              target={this.props.target}
            >
              <Tooltip id="tooltip" className="tooltip" >Can't have more than 5 tags</Tooltip>
            </Overlay>
          </div>
        </div>
      );
  }
}
