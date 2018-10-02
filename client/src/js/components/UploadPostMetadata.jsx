import React from 'react';
import Tags from './Tags.jsx'
import Autosuggest from 'react-autosuggest';
import Cookie from 'js-cookie'

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestions(value, list) {
  const escapedValue = escapeRegexCharacters(value.trim());
  if (escapedValue === '') {
    return [];
  }
  const regex = new RegExp('^' + escapedValue, 'i');
  return list.filter(item => regex.test(item.genre));
}

function getSuggestionValue(suggestion) {
  return suggestion.genre.replace(/^\w/, c => c.toUpperCase());
}

function renderSuggestion(suggestion) {
  return (
    <span>{suggestion.genre.replace(/^\w/, c => c.toUpperCase())}</span>
  );
}


export default class UploadMetadata extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      url: '',
      urlAvailable: false,
      genre: '',
      description: '',
      topGenres: [],
      genreSuggestions: [],
      topBrands: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.setUrlPlaceholder = this.setUrlPlaceholder.bind(this)
    this.checkUrlAvailability = this.checkUrlAvailability.bind(this)
    this.fetchUrlAvailable = this.fetchUrlAvailable.bind(this)
  }

  componentDidMount() {
    window.scrollTo(0,0)
    fetch('/api/topGenres', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({topGenres: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleChange(e) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      [e.target.name]: value
    });
  }

  setUrlPlaceholder(e) {
    this.setState({url: this.state.title.replace(/\W+/g, '-').toLowerCase()})
    this.fetchUrlAvailable(this.state.title.replace(/\W+/g, '-').toLowerCase())
  }

  checkUrlAvailability(e) {
    this.setState({url: e.target.value.replace(/\W+/g, '-').toLowerCase()})
    this.fetchUrlAvailable(e.target.value.replace(/\W+/g, '-').toLowerCase())

  }

  fetchUrlAvailable(url) {
    if (url) {
      fetch('/api/urlAvailable/' + url, {
        credentials: 'include'
      })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        this.setState({urlAvailable: (data.length === 0)});
      })
      .catch((error) => {
        console.error(error);
      });
    }
  }

  onChange = (event, { newValue, method }) => {
    this.setState({
      genre: newValue
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
   this.setState({genreSuggestions: getSuggestions(value, this.state.topGenres)});
  };

  onSuggestionsClearRequested = () => {
   this.setState({genreSuggestions: []});
  };

  render() {
    var value = this.state.genre
    const inputProps = {value, onChange: this.onChange}
    return (
      <div id="input_div">
        <button id="back_button" onClick={this.props.goBack}>Back</button>
        <p className="form_input_text" id="tags_input"><span>Post</span></p>
        <label className="required">Title:</label>
        <input type="text" autoComplete="off" name="title" onChange={this.handleChange} onBlur={this.setUrlPlaceholder} value={this.state.title}></input>
        <div className="url_div">
          <p className="url_head">{"fashion.com/" + Cookie.get('username') + "/"}</p>
          <input className="url" type="text" autoComplete="off" name="url" onChange={this.checkUrlAvailability}
            placeholder={this.state.url} value={this.state.url} style={{boxShadow: (this.state.urlAvailable || !this.state.url ? "" : "0 1px 0px 0px red")}}></input>
        </div>
        <label className="required">Genre:</label>
        <Autosuggest
          suggestions={this.state.genreSuggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
        <label>Description:</label>
        <textarea type="text" autoComplete="off" rows="5" name="description" onChange={this.handleChange} value={this.state.description}></textarea>
        <p className="form_input_text" id="tags_input"><span>Tags</span></p>
        {this.props.tags.length === 0 ?
          <div className="no_tags_indicator">
            <p>Click on your fit to make tags!</p>
          </div>
          :
          null
        }
        <Tags
          tags={this.props.tags}
          modify={this.props.modify}
          handleTagDelete={this.props.handleTagDelete}
          handleTagEdit={this.props.handleTagEdit}
          carouselIndex={this.props.carouselIndex}
          setTagCarouselIndex={this.props.setTagCarouselIndex}
        />
        <input id="form_submit" type="button" onClick={this.props.handleSubmit.bind(this, this.state.title, this.state.url, this.state.genre, this.state.description)}
          value="Submit" disabled={!(this.state.title && this.state.genre && this.state.urlAvailable)}></input>
      </div>
    )
  }
}
