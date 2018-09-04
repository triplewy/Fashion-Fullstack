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
      weekViews: 0
    };

    this.fetchStats = this.fetchStats.bind(this)
  }

  fetchStats() {
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
  }

  render() {
    return (
      <Dropdown id="navbar_profile_dropdown" onToggle={this.fetchStats}>
        <Dropdown.Toggle className="banner_button" noCaret={true}>
          <div id="profile_image_div">
            <img id="profile_image" alt="" src={this.props.profile_image_src}></img>
          </div>
          <p id="user_name">{this.props.profileName}</p>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <li>
            <Link to={"/" + this.props.username}>Profile</Link>
          </li>
          <li>
            <Link to={"/you/collections"}>Collections</Link>
          </li>
          <li>
            <StatsColumn dayViews={this.state.dayViews} weekViews={this.state.weekViews} totalViews={this.state.totalViews} />
          </li>
          <li>
            <button onClick={this.props.handleLogout}>Logout</button>
          </li>
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
