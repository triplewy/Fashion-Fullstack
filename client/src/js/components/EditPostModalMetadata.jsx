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

export default class EditPostModalMetadata extends React.Component {
  constructor(props) {
    super(props);
    const post = this.props.post
    this.state = {
      titleInput: post.title,
      urlInput: post.url,
      urlAvailable: true,
      genreInput: post.genre.replace(/^\w/, c => c.toUpperCase()),
      descriptionInput: post.description,

      topGenres: [],
      genreSuggestions: [],
      topBrands: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this)
    this.setUrlPlaceholder = this.setUrlPlaceholder.bind(this)
    this.checkUrlAvailability = this.checkUrlAvailability.bind(this)
    this.fetchUrlAvailable = this.fetchUrlAvailable.bind(this)
  }

  componentDidMount() {
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

  handleSave() {
    var original = false;
    for (var i = 0; i < this.props.tags.length; i++) {
      if (this.props.tags[i].original) {
        original = true;
        break;
      }
    }

    fetch('/api/editPost', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.post.mediaId,
        title: this.state.titleInput,
        url: this.state.urlInput,
        genre: this.state.genreInput,
        description: this.state.descriptionInput,
        original: original,
        tags: this.props.tags
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.message === 'success') {
        window.location.reload()
      }
    })
    .catch(e => {
      console.log(e);
    })

  }

  handleChange(e) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      [e.target.name]: value
    });
  }

  setUrlPlaceholder(e) {
    const title = this.state.titleInput.replace(/\W+/g, '-').toLowerCase()
    this.setState({urlInput: title})
    this.fetchUrlAvailable(title)
  }

  checkUrlAvailability(e) {
    const url = e.target.value.replace(/\W+/g, '-').toLowerCase()
    this.setState({urlInput: url})
    this.fetchUrlAvailable(url)
  }

  fetchUrlAvailable(url) {
    if (url === this.props.post.url) {
      this.setState({urlAvailable: true})
    } else {
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
        })
      }
      else {
        this.setState({urlAvailable: false})
      }
    }
  }

  onChange = (event, { newValue, method }) => {
    this.setState({
      genreInput: newValue
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
   this.setState({genreSuggestions: getSuggestions(value, this.state.topGenres)});
  };

  onSuggestionsClearRequested = () => {
   this.setState({genreSuggestions: []});
  };

  render() {
    var value = this.state.genreInput
    const inputProps = {value, onChange: this.onChange}
    const post = this.props.post
    return (
      <div id="input_div">
        <p id="tags_input"><span>Post</span></p>
        <label className="required">Title:</label>
        <input type="text" autoComplete="off" name="titleInput" onChange={this.handleChange} onBlur={this.setUrlPlaceholder} value={this.state.titleInput}
          style={{boxShadow: this.state.titleInput === post.title ? "" : "0 1px 0px 0px green"}}></input>
        <div className="url_div">
          <p className="url_head">{"fashion.com/" + Cookie.get('username') + "/"}</p>
          <input className="url" type="text" autoComplete="off" name="urlInput" onChange={this.checkUrlAvailability} placeholder={this.state.urlInput} value={this.state.urlInput}
            style={{boxShadow: this.state.urlAvailable || !this.state.urlInput ? (this.state.urlInput === post.url ? "" : "0 1px 0px 0px green") : "0 1px 0px 0px red"}}></input>
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
        <textarea type="text" autoComplete="off" rows="5" name="descriptionInput" onChange={this.handleChange} value={this.state.descriptionInput}
          style={{border: this.state.descriptionInput === post.description ? "" : "1px solid green"}}></textarea>
        <p id="tags_input"><span>Tags</span></p>
        <Tags
          modify
          tags={this.props.tags}
          handleTagDelete={this.props.handleTagDelete}
          handleTagEdit={this.props.handleTagEdit}
          carouselIndex={this.props.carouselIndex}
          setCarouselIndex={this.props.setCarouselIndex}/>
        <div className="input_div_submit">
          <button className="cancel" onClick={this.props.closeModal}>Cancel</button>
          <button className="save" onClick={this.handleSave} disabled={!(this.state.titleInput && this.state.genreInput && this.state.urlAvailable)}>Save</button>
        </div>
      </div>
    )
  }
}
