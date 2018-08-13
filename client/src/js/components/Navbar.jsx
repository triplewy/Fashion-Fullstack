import React from 'react';
import StatsColumn from './StatsColumn.jsx'
import LoginModal from './LoginModal.jsx'
import Notifications from './Notifications.jsx'
import { Link, Redirect} from 'react-router-dom';
import notification_icon from 'images/notification-icon.png'
import socketIOClient from 'socket.io-client'

// {this.state.search_redirect && <Redirect to={'/search'}/>}

export default class Navbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      search_value: '',
      search_redirect: false,
      profileUrl: '',
      profile_image_src: '',
      profileName: '',
      showNavbar: true,
      lastScrollY: 0,
      loggedIn: this.props.loggedIn,
      showLoginModal: false,
      redirect: false
    };
    this.onChange = this.onChange.bind(this);
    this.searchSubmit = this.searchSubmit.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.showLoginModal = this.showLoginModal.bind(this)
    this.closeLoginModal = this.closeLoginModal.bind(this)
    this.fetchNavbar = this.fetchNavbar.bind(this)
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll, { passive: true })
    this.fetchNavbar()
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  componentWillReceiveProps(nextProps) {
    this.fetchNavbar()
  }

  searchSubmit(e) {
    if (this.state.search_value) {
      this.setState({
        search_redirect: true
      })
    }
  }

  onChange(e) {
    this.setState({
      search_value: e.target.value,
    });
  }

  handleScroll(e) {
    var lastScrollY = this.state.lastScrollY
    var currentScrollY = window.scrollY

    if (currentScrollY < 136) {
    } else if (this.state.showNavbar && currentScrollY > lastScrollY) {
      this.setState({showNavbar: false, lastScrollY: currentScrollY})
    } else if (!this.state.showNavbar && currentScrollY < lastScrollY) {
      this.setState({showNavbar: true, lastScrollY: currentScrollY})
    } else {
      this.setState({lastScrollY: currentScrollY})
    }
  }

  showLoginModal(e) {
    this.setState({showLoginModal: true})
  }

  closeLoginModal(e) {
    this.setState({showLoginModal: false})
  }

  fetchNavbar() {
    fetch('/api/navbar', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        if (data.message === 'not logged in') {
          this.setState({
            loggedIn: false,
            showLoginModal: false
          })
        } else {
          this.setState({
            username: data.username,
            profile_image_src: data.profile_image_src,
            profileName: data.profileName,
            loggedIn: true,
            showLoginModal: false
          });
        }
      }
    })
  }

  render() {
      return (
        <div id={this.state.showNavbar ? 'banner' : 'banner_hide'}>
          <div id="banner_left" className="banner_section">
            <Link to="/" id="banner_title">
              <h1>Fashion</h1>
            </Link>
          </div>
          <div id="banner_center" className="banner_section">
            <div id="search_bar_div">
              <input id="search_bar" type="text" placeholder="Search"
                onChange={this.onChange} value={this.state.search_value}></input>
              <button id="search_bar_button" disabled={!this.state.search_value} onClick={this.searchSubmit}>Go</button>
            </div>
          </div>
          <div id="banner_right" className="banner_section">
            {this.state.loggedIn ?
              <div id="banner_user_div">
              <Link to="/finder">
                <button id="outfit_finder_button" className="banner_button">Explore</button>
              </Link>
              <Link to="/upload">
                <button id="upload_button" className="banner_button">Upload</button>
              </Link>
              <div className="btn-group">
                <button className="dropdown-toggle" type="button" data-toggle="dropdown">
                  <div id="profile_image_div">
                    <img id="profile_image" alt="" src={this.state.profile_image_src}></img>
                  </div>
                  <p id="user_name">{this.state.profileName}</p>
                  <span className="caret"></span>
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link to={"/" + this.state.username}>Profile</Link>
                  </li>
                  <li>
                    <Link to={"/you/collections"}>Collections</Link>
                  </li>
                  <li>
                    <StatsColumn show_profile={false}/>
                  </li>
                  <li>
                    <button onClick={this.props.handleLogout}>Logout</button>
                  </li>
                </ul>
              </div>
              <Notifications />
              <div className="btn-group">
                <button className="dropdown-toggle" type="button" data-toggle="dropdown">
                  Messages<span className="caret"></span>
                </button>
                <ul className="dropdown-menu">
                  <li className="form-group">
                    Yo
                  </li>
                </ul>
              </div>
            </div>
            :
            <div id="banner_user_div">
              <button id="banner_login_button" onClick={this.showLoginModal}>Login</button>
              <LoginModal showModal={this.state.showLoginModal} closeModal={this.closeLoginModal} handleLogin={this.props.handleLogin}/>
              <Link to={"/signup"}>
                <button id="signup_button" className="banner_button">Sign Up</button>
              </Link>
            </div>
          }
          </div>
      </div>
    );
  }
}
