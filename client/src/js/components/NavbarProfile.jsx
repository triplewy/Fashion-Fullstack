import React from 'react';
import StatsColumn from './StatsColumn.jsx'
import {Dropdown} from 'react-bootstrap'
import { Link } from 'react-router-dom';

export default class NavbarProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      totalViews: 0,
      dayViews: 0,
      weekViews: 0,
      open: false
    };

    this.fetchStats = this.fetchStats.bind(this)
    this.closeDropdown = this.closeDropdown.bind(this)
  }

  fetchStats() {
    if (!this.state.open) {
      this.setState({open: true})
      fetch('/api/profileStats', {
        credentials: 'include'
      })
      .then(res => res.json())
      .then(data => {
        if (data) {
          console.log(data);
          this.setState({dayViews: data.dayViews, weekViews: data.weekViews, totalViews: data.totalViews})
        }
      })
      .catch(e => {
        console.log(e);
      })
    } else {
      this.setState({open: false})
    }
  }

  closeDropdown(e) {
    this.setState({open: false})
  }

  render() {
    return (
      <Dropdown id="navbar_profile_dropdown" onToggle={this.fetchStats} open={this.state.open} pullRight={true}>
        <Dropdown.Toggle noCaret={true}>
          <div id="profile_image_div" style={{backgroundImage: 'url(' + this.props.profile_image_src + ')'}} />
          <p id="user_name">{this.props.profileName}</p>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <li onClick={this.closeDropdown}>
            <Link to={"/" + this.props.username}>Profile</Link>
          </li>
          <li onClick={this.closeDropdown}>
            <Link to={"/you/likes/posts"}>Likes</Link>
          </li>
          <li>
            <StatsColumn dayViews={this.state.dayViews} weekViews={this.state.weekViews} totalViews={this.state.totalViews} closeDropdown={this.closeDropdown}/>
          </li>
          <li>
            <button onClick={this.props.handleLogout}>Logout</button>
          </li>
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
