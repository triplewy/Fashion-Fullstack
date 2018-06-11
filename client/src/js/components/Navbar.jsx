import React from 'react';
import { Link, Redirect} from 'react-router-dom';
import notification_icon from 'images/notification-icon.png'
export default class Navbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      search_value: '',
      search_redirect: false
    };
    this.onChange = this.onChange.bind(this);
    this.searchSubmit = this.searchSubmit.bind(this);
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
          <Link to="/profile">
            <button id="profile_button" className="banner_button">Profile</button>
          </Link>
          <img id="notification_button" alt="notifications icon" className="banner_button"
            src={notification_icon}></img>
          <Link to="/profile/collections">
            <button id="collections_button" className="banner_button">Collections</button>
          </Link>
          <Link to="/profile/stats">
            <button id="stats_button" className="banner_button">Stats</button>
          </Link>
		    </div>
    );
  }
}
