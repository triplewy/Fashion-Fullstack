import React from 'react';
import Autosuggest from 'react-autosuggest';
import PlaylistPosts from './PlaylistPosts.jsx'
import ProfileHover from './ProfileHover.jsx'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Link, Redirect } from 'react-router-dom'
import { Overlay, Tooltip } from 'react-bootstrap'
import view_icon from 'images/view-icon.png'
import trash_icon from 'images/trash-icon.png'

const url = process.env.REACT_APP_API_URL

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

export default class EditCollectionModalMetadata extends React.Component {
  constructor(props) {
    super(props);
    const collection = this.props.collection
    this.state = {
      titleInput: collection.title,
      urlInput: collection.url,
      urlAvailable: true,
      genreInput: collection.genre,
      descriptionInput: collection.description,

      deletedPosts: [],

      showOverlay: false,
      target: null,

      topGenres: [],
      genreSuggestions: [],

      redirect: false
    };

    this.fetchTopGenres = this.fetchTopGenres.bind(this)
    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this)
    this.setUrlPlaceholder = this.setUrlPlaceholder.bind(this)
    this.checkUrlAvailability = this.checkUrlAvailability.bind(this)
    this.fetchUrlAvailable = this.fetchUrlAvailable.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.handlePostDelete = this.handlePostDelete.bind(this)
  }

  fetchTopGenres() {
    fetch(url + '/api/topGenres', {
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
    fetch(url + '/api/editCollection', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        playlistId: this.props.collection.playlistId,
        title: this.state.titleInput,
        url: this.state.urlInput,
        genre: this.state.genreInput,
        description: this.state.descriptionInput,
        posts: this.props.posts,
        deletedPosts: this.state.deletedPosts
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.message === 'success') {
        if (this.props.SinglePlaylistPage && this.state.urlInput !== this.props.collection.url) {
          this.setState({redirect: true})
          this.props.closeModal()
        } else {
          window.location.reload()
        }
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

  fetchUrlAvailable(inputUrl) {
    if (inputUrl === this.props.collection.url) {
      this.setState({urlAvailable: true})
    } else {
      if (inputUrl) {
        fetch(url + '/api/urlAvailable/collection/' + inputUrl, {
          credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
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

  onDragEnd(result) {
    if (result.destination) {
      this.props.reorder(result.source.index, result.destination.index)
    }
  }

  handlePostDelete(mediaId, index, e) {
    e.stopPropagation()
    if (this.props.posts.length < 2) {
      this.setState({showOverlay: true, target: e.target})
      setTimeout(function() {
        this.setState({showOverlay: false})
      }.bind(this), 2000)
    } else {
      var deletedPosts = this.state.deletedPosts
      deletedPosts.push(mediaId)
      this.setState({deletedPosts: deletedPosts})
      this.props.handlePostDelete(index)
    }

  }

  render() {
    if (this.state.redirect) {
      return (
        <Redirect to={this.state.urlInput} />
      )
    } else {
      var value = this.state.genreInput
      if (!value) {
        value = ""
      }
      const inputProps = {value: value, onChange: this.onChange}
      const collection = this.props.collection

      var renderedList = [];
      if (this.props.posts.length > 0) {
        renderedList = this.props.posts.map((item, index) => {
          return (
            <Draggable key={index} draggableId={"post_drag" + index} index={index}>
              {(provided, snapshot) => (
                <li
                  disabled={(this.state.playlistIndex === index)}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  onClick={this.props.setPlaylistIndex.bind(this, index)}
                >
                  {/* <div className="playlist_post_drag"> */}
                    <ProfileHover username={item.username} profileName={item.profileName} classStyle={"post_profile_link"}/>
                    <div className="playlist_post_title">
                      <p>{item.title}</p>
                    </div>
                    <div className="original">
                      {item.original !== 0 && <span>✔</span>}
                    </div>
                    <div className="views">
                      <div style={{backgroundImage: 'url(' + view_icon + ')'}}></div>
                      <p>{item.views}</p>
                    </div>
                    <button className="tag_modifier_button" id="delete_tag_button" type="button" onClick={this.handlePostDelete.bind(this, item.mediaId, index)}>
                      <img className="tag_modifier_button_image" src={trash_icon} alt="delete icon"></img>
                    </button>
                    <Overlay
                      show={this.state.showOverlay}
                      placement="left"
                      target={this.state.target}
                    >
                      <Tooltip id="tooltip" className="tooltip" >Must have at least 1 post in collection</Tooltip>
                    </Overlay>
                  </li>
                // </div>
              )}
            </Draggable>
          )
        })
      }

      return (
        <div id="input_div">
          <p id="tags_input"><span>Collection</span></p>
          <label className="required">Title:</label>
          <input type="text" autoComplete="off" name="titleInput" onChange={this.handleChange} value={this.state.titleInput}
            style={{boxShadow: this.state.titleInput === collection.title ? "" : "0 1px 0px 0px green"}}></input>
          <div className="url_div">
            <p className="url_head">{"fashion.com/" + this.props.collection.username + "/collection/"}</p>
            <input className="url" type="text" autoComplete="off" name="urlInput" onChange={this.checkUrlAvailability} placeholder={this.state.urlInput} value={this.state.urlInput}
              style={{boxShadow: this.state.urlAvailable && this.state.urlInput ? (this.state.urlInput === collection.url ? "" : "0 1px 0px 0px green") : "0 1px 0px 0px red"}}></input>
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
            style={{border: this.state.descriptionInput === collection.description ? "" : "1px solid green"}}></textarea>
          <p id="tags_input"><span>Posts</span></p>
          <p>Drag to reorder</p>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  id="playlist_posts_modal"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {renderedList}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="input_div_submit">
            <button className="cancel" onClick={this.props.closeModal}>Cancel</button>
            <button className="save" onClick={this.handleSave} disabled={!(this.state.titleInput && this.state.genreInput && this.state.urlAvailable)}>Save</button>
          </div>
        </div>
      )
    }
  }
}
