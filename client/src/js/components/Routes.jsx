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

import Home from './Home.jsx';
import Signup from './Signup.jsx'
import Verify from './Verify.jsx'
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
  constructor(props) {
    super(props)
    this.state = {
      files: [],
      dropzoneActive: false,
      redirect: false,
      redirectFromSignup: false,
      redirectUrlFromSignup: '',
      loggedIn: Cookie.get('userId') ? true : false
    }

    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.handleSignup = this.handleSignup.bind(this)
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLoginRedirect = this.handleLoginRedirect.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
  }

  componentWillMount() {
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

  handleSignup(email, username, password) {
    fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email,
        username: username,
        password: password,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'success') {
        this.setState({loggedIn: true})
      }
    }).catch(function(err) {
        console.log(err);
    });
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
      } else {
        this.setState({loggedIn: false})
      }
    })
    .catch(function(err) {
        console.log(err);
    });
  }

  handleLoginRedirect(username, password, url) {
    console.log("url is", url);
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
        if (url) {
          this.setState({loggedIn: true, redirectFromSignup: true, redirectUrlFromSignup: url});
        } else {
          this.setState({loggedIn: true, redirectFromSignup: true, redirectUrlFromSignup: '/'});
        }
      } else {
        this.setState({loggedIn: false})
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
    // const { files, dropzoneActive } = this.state;
    const PrivateRoute = ({component: Component}) => (
      <Route render={(props) => (this.state.loggedIn ? <Component {...props}/> : <Redirect to={{pathname: '/signup', state: {from: props.location}}} /> )} />
    )
    console.log("is loggedIn", this.state.loggedIn);

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
            {this.state.redirectFromSignup && <Redirect to={this.state.redirectUrlFromSignup} />}

            <Navbar loggedIn={this.state.loggedIn} handleLogin={this.handleLogin} handleLogout={this.handleLogout}/>
            <Switch>
              <Route exact path='/' component={this.state.loggedIn ? Stream : Home}/>
              <PrivateRoute exact path='/upload' component={Upload} />}/>
              <PrivateRoute exact path='/you/collections' component={Collections} />
              <PrivateRoute exact path='/you/stats' component={Stats} />
              <Route path='/verify' component={Verify} />
              <Route exact path='/finder' component={Outfit_Finder}/>
              <Route exact path='/search' component={Search}/>
              <Route exact path='/signup' render={(props) => <Signup handleLogin={this.handleLoginRedirect} handleSignup={this.handleSignup} {...props}/>} />
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
