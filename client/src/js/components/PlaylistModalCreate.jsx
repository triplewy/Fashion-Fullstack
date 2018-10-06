import React from 'react';

const url = process.env.REACT_APP_API_URL

export default class PlaylistModalCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      titleInput: '',
      url: '',
      urlAvailable: false,
      genreInput: '',
      descriptionInput: '',
      selectedOption: 'private',
      loading: false,
      showAlert: false,
      success: false
    };

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this);
    this.checkUrlAvailability = this.checkUrlAvailability.bind(this)
    this.fetchUrlAvailable = this.fetchUrlAvailable.bind(this)
    this.showAlert = this.showAlert.bind(this)
  }

  handleChange(e) {
    this.setState({[e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    this.setState({loading: true})

    var isPublic = false
    if (this.state.selectedOption === 'public') {
      isPublic = true
    }
    fetch(url + '/api/newPlaylist', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        title: this.state.titleInput,
        url: this.state.url,
        genre: this.state.genreInput,
        description: this.state.descriptionInput,
        isPublic: isPublic,
        mediaId: this.props.mediaId
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        console.log("Added to playlist successfully");
        this.setState({titleInput: '', url: '', urlAvailable: false, genreInput: '', descriptionInput: '', selectedOption: 'private'})
        this.showAlert(true)
      } else {
        this.showAlert(false)
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  checkUrlAvailability(e) {
    this.setState({url: e.target.value.replace(/\W+/g, '-').toLowerCase()})
    this.fetchUrlAvailable(e.target.value.replace(/\W+/g, '-').toLowerCase())
  }

  fetchUrlAvailable(inputUrl) {
    if (inputUrl) {
      fetch(url + '/api/urlAvailable/collection/' + inputUrl, {
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

  showAlert(status) {
    this.setState({showAlert: true, success: status, loading: false})
    setTimeout(function() {
      if (status) {
        window.location.reload()
      } else {
        this.setState({showAlert: false, success: status, loading: false})
      }
    }.bind(this), 2000)
  }

  render() {
    return (
      <div id="create_new_playlist_wrapper">
        <div id="input_div">
          <label className="required">Title:</label>
          <input type="text" autoComplete="off" name="titleInput" onChange={this.handleChange} onBlur={this.checkUrlAvailability} value={this.state.titleInput}></input>
          <div className="url_div">
            <p className="url_head">{"fashion.com/" + this.props.username + "/collection/"}</p>
            <input className="url" type="text" autoComplete="off" name="url" onChange={this.checkUrlAvailability}
              placeholder={this.state.url} value={this.state.url} style={{boxShadow: (this.state.urlAvailable || !this.state.url ? "" : "0 1px 0px 0px red")}}></input>
          </div>
          <label className="required">Genre:</label>
          <input type="text" autoComplete="off" name="genreInput" onChange={this.handleChange} value={this.state.genreInput}></input>
          <label>Description:</label>
          <textarea type="text" autoComplete="off" rows="5" name="descriptionInput" onChange={this.handleChange} value={this.state.descriptionInput}></textarea>
          {/* <div className="playlist_input_div">
            <label className="playlist_input_label">Public</label>
            <input className="playlist_input" type="radio" name="selectedOption" value="public"
              checked={this.state.selectedOption === 'public'} onChange={this.handleChange}></input>
            <label className="playlist_input_label">Private</label>
            <input className="playlist_input" type="radio" name="selectedOption"
              value="private" checked={this.state.selectedOption === 'private'}
              onChange={this.handleChange}></input>
          </div> */}
        </div>
        <button className="submit" type="button" onClick={this.handleSubmit}
          disabled={!this.state.titleInput || !this.state.genreInput || !this.state.urlAvailable || this.state.loading}>
          <div className="success" style={{width: this.state.showAlert ? '100%' : '0', backgroundColor: this.state.success ? '#9BDEBF' : '#C24750'}}>
            <p>{this.state.success? "Created successfully!" : "Could not create playlist"}</p>
          </div>
          Create
        </button>
      </div>
    )
  }
}
