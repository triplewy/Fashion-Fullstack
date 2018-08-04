import React from 'react';
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import Dropzone from 'react-dropzone'
import {Modal} from 'react-bootstrap';
import Cookie from 'js-cookie'
import CookieParser from 'cookie-parser'
import {CookiesProvider, withCookies, Cookies} from 'react-cookie'


import Home from './Home.jsx';
import Navbar from './Navbar.jsx'
import Stream from './Stream.jsx';
import Profile from './Profile.jsx';
import SinglePostPage from './SinglePostPage.jsx'
import SinglePlaylistPage from './SinglePlaylistPage.jsx'
import Collections from './Collections.jsx'
import Upload from './Upload.jsx'
import Outfit_Finder from './OutfitFinder.jsx'
import Search from './Search.jsx'
import Playlist from './Playlist.jsx'
import Stats from './Stats.jsx'

export default class Routes extends React.Component {
  constructor() {
    super()
    this.state = {
      files: [],
      dropzoneActive: false,
      redirect: false,
      userId: null,
      loggedIn: false
    }

    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this)
  }

  componentWillMount() {
    console.log(Cookie.get('connect.sid'));
    var sessionId = CookieParser.signedCookie(Cookie.get('connect.sid'), 'secret');
    console.log("sessionId is", sessionId);

  }


  onDragEnter() {
    console.log("we in here");
    this.setState({dropzoneActive: true, redirect: false});
  }

  onDragLeave() {
    console.log("we not in here");
    this.setState({dropzoneActive: false, redirect: false});
  }

  onDrop(accepted, rejected) {
    console.log("files dropped", accepted);
    if (accepted) {
      this.setState({files: accepted, dropzoneActive: false, redirect: true});
    }
  }

  handleLogin(username, password) {
    fetch('/api/signin', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: username,
        password: password,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message == 'success') {
        this.setState({loggedIn: true});
      }
    })
    .catch(function(err) {
        console.log(err);
    });
  }

  handleLogout() {
    fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
      if (data.message == 'success') {
        this.setState({loggedIn: false})
      } else {
        console.log("Could not logout for some reason");
      }
    }).catch(function(err) {
        console.log(err);
    });
  }

  render() {
    const { files, dropzoneActive } = this.state;

    return (
      <BrowserRouter>
        <div>
          <Dropzone
              disableClick
              accept={['image/jpg', 'image/png', 'image/jpeg']}
              style={{position: "absolute", width: '100%'}}
              multiple={false}
              onDrop={this.onDrop}
              onDragEnter={this.onDragEnter}
          >
            <Modal show={this.state.dropzoneActive} onDragLeave={this.onDragLeave} style={{'pointerEvents': 'none', 'width': '90%', 'height': '90%'}}>
              <Modal.Header closeButton>
                <Modal.Title>Modal heading</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div>Modal content here </div>
              </Modal.Body>
            </Modal>
            {this.state.redirect && <Redirect to={{pathname: '/upload', state: {files: this.state.files}}} />}
            <Navbar loggedIn={this.state.loggedIn} handleLogin={this.handleLogin} handleLogout={this.handleLogout}/>
            <Switch>
              <Route exact path='/' component={this.state.loggedIn ? Stream : Home}/>
              <Route exact path='/upload' component={Upload}/>
              <Route exact path='/finder' component={Outfit_Finder}/>
              <Route exact path='/search' component={Search}/>
              <Route exact path='/you/collections' component={Collections} />
              <Route exact path='/you/stats' component={Stats} />
              <Route exact path='/:profile' render={({match}) => <Profile loggedIn={this.state.loggedIn} profile={match.params.profile} />} />
              <Route exact path='/:profile/:mediaId' component={SinglePostPage}/>
              <Route exact path='/:profile/playlist/:playlistId' component={SinglePlaylistPage}/>
              <Route exact path='/:profile/playlists/:playlistId' component={Playlist}/>
            </Switch>
          </Dropzone>
        </div>
      </BrowserRouter>
    )
  }
}
