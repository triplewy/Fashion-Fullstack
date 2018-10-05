import React from 'react';
import ProfileHover from './ProfileHover.jsx'
import view_icon from 'images/view-icon-revised.png'

const url = process.env.REACT_APP_API_URL

export default class PlaylistPosts extends React.Component {
  constructor(props) {
    super(props);

    var views = [this.props.posts.length]
    for (var i = 0; i < this.props.posts.length; i++) {
      views[i] = this.props.posts[i].views
    }
    this.state = {
      views: views
    };

    this.handleClick = this.handleClick.bind(this)
    this.postVisit = this.postVisit.bind(this)
  }

  handleClick(index, mediaId) {
    this.props.setPlaylistIndex(index)
    if (this.props.playlistIndex !== index) {
      this.postVisit(index, mediaId)
    }
  }

  postVisit(index, mediaId) {
    const now = new Date()
    const nowISOString = now.toISOString()
    const view = {playlistId: this.props.playlistId, repost_username: this.props.repost_username, mediaId: mediaId, dateTime: nowISOString}
    fetch(url + '/api/collectionPostVisit', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        view: view,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        var views = this.state.views
        views[index] = views[index] + 1
        this.setState({views: views})
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    var renderedPlaylistPosts = [];
    var posts = this.props.posts
    if (posts) {
      renderedPlaylistPosts = posts.map((item, index) => {
        return (
          <li key={index} value={index} className={(this.props.playlistIndex === index) ? 'selected' : ''}
                disabled={(this.props.playlistIndex === index)} onClick={this.handleClick.bind(this, index, item.mediaId)}>
              <ProfileHover
                username={item.username}
                profileName={item.profileName}
                classStyle={"post_profile_link"}
              />
              <div className="playlist_post_title">
                <p>{item.title}</p>
              </div>
              <div className="original">
                {item.original !== 0 && <span>✔</span>}
              </div>
              <div className="views">
                <div style={{backgroundImage: 'url(' + view_icon + ')'}}></div>
                <p>{this.state.views[index]}</p>
              </div>
          </li>
          )
      });
    }
    return (
      <ul id="playlist_posts_list">
        {renderedPlaylistPosts}
      </ul>
    );
  }
}
