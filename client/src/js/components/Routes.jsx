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
import Likes from './Likes.jsx'
import UploadDropzone from './UploadDropzone.jsx'
import Explore from './Explore.jsx'
import Search from './Search.jsx'
import Stats from './Stats.jsx'
import NotificationsPage from './NotificationsPage.jsx'
import FollowersPage from './FollowersPage.jsx'
import FollowingPage from './FollowingPage.jsx'
import GenrePage from './GenrePage.jsx'
import ErrorPage from './ErrorPage.jsx'

const url = process.env.REACT_APP_API_URL

export default class Routes extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      showLoginModal: false
    }

    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this)
    this.setUser = this.setUser.bind(this)
    this.toggleLoginModal = this.toggleLoginModal.bind(this)
  }

  componentDidMount() {
    // Cookie.set('postsViews', [])
    // Cookie.set('collectionsViews', [])

    fetch(url + '/api/sessionLogin', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "not logged in") {
        this.setState({user: null})
      } else {
        this.setState({user: data})
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleLogin(username, password) {
    var seen = [];

    fetch(url + '/api/signin', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: username,
        password: password,
      }, function(key, val) {
        if (val != null && typeof val == "object") {
          if (seen.indexOf(val) >= 0) {
            return;
          }
          seen.push(val);
        }
        return val;
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'not logged in') {
        this.setState({user: null});
      } else {
        this.setState({user: data, showLoginModal: false})
      }
    })
    .catch(function(err) {
        console.log(err);
    });
  }

  handleLogout() {
    fetch(url + '/api/logout', {
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
        this.setState({user: null})
      } else {
        console.log("Could not logout for some reason");
      }
    }).catch(function(err) {
        console.log(err);
    });
  }

  setUser(user) {
    console.log(user);
    this.setState({user: user})
  }

  toggleLoginModal() {
    this.setState({showLoginModal: !this.state.showLoginModal})
  }

  render() {
    const PrivateRoute = ({component: Component, ...rest}) => (
      <Route {...rest} render={(props) => (this.state.user ? <Component user={this.state.user} {...props}/> : <Redirect to={{pathname: '/signup', state: {from: props.location}}} /> )} />
    )
    return (
      <BrowserRouter>
        <div>
          <Navbar
            user={this.state.user}
            showLoginModal={this.state.showLoginModal}
            handleLogin={this.handleLogin}
            handleLogout={this.handleLogout}
            toggleLoginModal={this.toggleLoginModal}
          />
          <div className="pageBody">
            <Switch>
              <Route exact path='/' render={(props) => this.state.user ? <Stream {...props}/> : <Home {...props}/>} />
              <PrivateRoute exact path='/upload' component={UploadDropzone} />
              <PrivateRoute exact path='/you/likes' component={Likes} />
              <PrivateRoute exact path='/you/stats' component={Stats} />
              <PrivateRoute exact path='/you/notifications' component={NotificationsPage} />
              <PrivateRoute exact path='/explore' component={Explore}/>
              <Route path='/verify' component={Verify} />
              <Route path='/search' component={Search} />
              <Route exact path='/explore/:genre' render={({match}) => <Explore genre={match.params.genre} />} />
              <Route exact path='/signup' render={(props) => <Signup setUser={this.setUser} user={this.state.user} {...props}/>} />
              <Route exact path='/genre/:genre' render={({match}) => <GenrePage genre={match.params.genre} />} />
              <Route exact path='/:profile' render={({match}) => <Profile profile={match.params.profile} setUser={this.setUser}/>} />
              <Route exact path='/:profile/followers' component={FollowersPage} />
              <Route exact path='/:profile/following' component={FollowingPage} />
              <Route exact path='/:profile/:url' component={SinglePostPage}/>
              <Route exact path='/:profile/album/:url' component={SinglePlaylistPage}/>
              <Route component={ErrorPage} />
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    )
  }
}
