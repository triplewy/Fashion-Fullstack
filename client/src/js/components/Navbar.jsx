import React from 'react';
import { Link, Redirect} from 'react-router-dom';
import notification_icon from 'images/notification-icon.png'
export default class Navbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      search_value: '',
      search_redirect: false,
      profileUrl: '',
      profile_image_src: '',
      profileName: ''
    };
    this.onChange = this.onChange.bind(this);
    this.searchSubmit = this.searchSubmit.bind(this);
  }

  componentDidMount() {
    fetch('/api/navbar', {
      credentials: 'include'
    })
    .then(res => {
      if (res.redirected) {
        return
      }
      else {
        return res.json()
      }
    })
    .then(data => {
      if (data) {
        this.setState({
          username: data.username,
          profile_image_src: data.profile_image_src,
          profileName: data.profileName
        });
      }
    })
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

  render() {
      return (
        <div id="banner">
			    <Link to="/">
            <h1 id="banner_title">Fashion</h1>
          </Link>
          <div id="search_bar_div">
            <form onSubmit={this.searchSubmit}>
              <input id="search_bar" type="text" placeholder="Search"
                onChange={this.onChange} value={this.state.search_value}></input>
              <button id="search_bar_button" type="submit" disabled={!this.state.search_value}>Go</button>
            </form>
            {this.state.search_redirect && (<Redirect to={'/search'}/>)}
          </div>
          <Link to="/finder">
            <button id="outfit_finder_button" className="banner_button">Explore</button>
          </Link>
          <Link to="/upload">
            <button id="upload_button" className="banner_button">Upload</button>
          </Link>
          <Link to={"/" + this.state.username}>
            <div id="profile_image_div">
              <img id="profile_image" alt="" src={this.state.profile_image_src}></img>
            </div>
            <strong id="user_name">{this.state.profileName}</strong>
          </Link>
          <img id="notification_button" alt="notifications icon" className="banner_button"
            src={notification_icon}></img>
          <Link to={"/you/collections"}>
            <button id="collections_button" className="banner_button">Collections</button>
          </Link>
          <Link to={"/you/stats"}>
            <button id="stats_button" className="banner_button">Stats</button>
          </Link>
		    </div>
    );
  }
}
