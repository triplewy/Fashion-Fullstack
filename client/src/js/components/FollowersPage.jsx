import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import TypeSelector from './TypeSelector.jsx'
import { Dropdown } from 'react-bootstrap'

export default class FollowersPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      orderByArray: ['Most Recent', 'Most Followers'],
      orderBy: 0,
      redirect: false
    };

    this.fetchFollowers = this.fetchFollowers.bind(this)
    this.toggle_type = this.toggle_type.bind(this);
    this.toggleOrder = this.toggleOrder.bind(this)
  }

  componentDidMount() {
    this.fetchFollowers(this.state.orderBy)
  }

  fetchFollowers(orderBy) {
    fetch('/api/followers/' + orderBy, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({users: data.followers});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  toggle_type(e) {
    if (e.target.name == 1) {
      this.setState({redirect: true})
    }
  }

  toggleOrder(index) {
    this.setState({orderBy: index})
    this.fetchFollowers(index)
  }

  render() {
    var renderedUsers = [];
    if (this.state.users) {
      renderedUsers = this.state.users.map((item, index) => {
        return (
          <div className="followers_profile" key={index}>
            <Link to={"/" + item.username}>
              <div>
                <img alt="" src={item.profile_image_src}></img>
              </div>
              <strong>{item.profileName}</strong>
            </Link>
          </div>
        )
      });
    }
    if (this.state.redirect) {
      return (
        <Redirect to="/you/following" />
      )
    }
    return (
      <div id="white_background_wrapper">
        <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["Followers", "Following"]}
        type_selector_value={0} right={
          <Dropdown id="followers dropdown" className="time_period_dropdown">
            <Dropdown.Toggle id="time_period_button" noCaret={true}>
              <p>{this.state.orderByArray[this.state.orderBy]}</p>
            </Dropdown.Toggle>
            <Dropdown.Menu id="time_period_list">
              <li onClick={this.toggleOrder.bind(this, 0)}>Most Recent</li>
              <li onClick={this.toggleOrder.bind(this, 1)}>Most Followers</li>
            </Dropdown.Menu>
          </Dropdown>
        }/>
        {renderedUsers}
      </div>
    );
  }
}
