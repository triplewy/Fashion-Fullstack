import React from 'react';
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
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
import UploadDropzone from './UploadDropzone.jsx'
import Explore from './Explore.jsx'
import Search from './Search.jsx'
import Playlist from './Playlist.jsx'
import Stats from './Stats.jsx'
import NotificationsPage from './NotificationsPage.jsx'
import FollowersPage from './FollowersPage.jsx'
import FollowingPage from './FollowingPage.jsx'
import GenrePage from './GenrePage.jsx'


export default class Routes extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loggedIn: Cookie.get('userId') ? true : false
    }

    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this)
    this.loggedIn = this.loggedIn.bind(this)
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
      if (data.message === 'success') {
        this.setState({loggedIn: true});
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
      if (data.message === 'success') {
        this.setState({loggedIn: false})
      } else {
        console.log("Could not logout for some reason");
      }
    }).catch(function(err) {
        console.log(err);
    });
  }

  loggedIn() {
    this.setState({loggedIn: true})
  }

  render() {
    const PrivateRoute = ({component: Component}) => (
      <Route render={(props) => (this.state.loggedIn ? <Component {...props}/> : <Redirect to={{pathname: '/signup', state: {from: props.location}}} /> )} />
    )
    console.log("is loggedIn", this.state.loggedIn);

    return (
      <BrowserRouter>
        <div>
          <Navbar loggedIn={this.state.loggedIn} handleLogin={this.handleLogin} handleLogout={this.handleLogout}/>
          <Switch>
            <Route exact path='/' component={this.state.loggedIn ? Stream : Home}/>
            <PrivateRoute exact path='/upload' component={UploadDropzone} />}/>
            <PrivateRoute exact path='/you/collections' component={Collections} />
            <PrivateRoute exact path='/you/stats' component={Stats} />
            <PrivateRoute exact path='/you/notifications' component={NotificationsPage} />
            <PrivateRoute exact path='/you/followers' component={FollowersPage} />
            <PrivateRoute exact path='/you/following' component={FollowingPage} />
            <Route path='/verify' component={Verify} />
            <Route exact path='/explore' component={Explore}/>
            <Route exact path='/explore/:genre' render={({match}) => <Explore genre={match.params.genre} />} />
            <Route exact path='/search' component={Search}/>
            <Route exact path='/signup' render={(props) => <Signup loggedIn={this.loggedIn} {...props}/>} />
            <Route exact path='/genre/:genre' render={({match}) => <GenrePage genre={match.params.genre} />} />
            <Route exact path='/:profile' render={({match}) => <Profile profile={match.params.profile} />} />
            <Route exact path='/:profile/:mediaId' component={SinglePostPage}/>
            <Route exact path='/:profile/playlist/:playlistId' component={SinglePlaylistPage}/>
            <Route exact path='/:profile/playlists/:playlistId' component={Playlist}/>
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}
