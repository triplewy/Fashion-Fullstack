import React from 'react';
import Autosuggest from 'react-autosuggest';

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

export default class GenreSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topGenres: [],
      genreSuggestions: []
    };
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

  onSuggestionsFetchRequested = ({ value }) => {
   this.setState({genreSuggestions: getSuggestions(value, this.state.topGenres)});
  };

  onSuggestionsClearRequested = () => {
   this.setState({genreSuggestions: []});
  };

  render() {
    const genre = this.props.genre
    const inputProps = {placeholder: 'All', value: genre, onChange: this.props.onChange.bind(this)}
    return (
      <div>
        <label>Genre:</label>
        <Autosuggest
          suggestions={this.state.genreSuggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
        <button onClick={this.props.searchGenre.bind(this, genre)}>Search</button>
      </div>
    );
  }
}
