import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import ProfileHover from './ProfileHover.jsx'
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

    this.fetchFollowing = this.fetchFollowing.bind(this)
    this.toggle_type = this.toggle_type.bind(this);
    this.toggleOrder = this.toggleOrder.bind(this)

  }

  componentDidMount() {
    this.fetchFollowing(this.state.orderBy)
  }

  fetchFollowing(orderBy) {
    fetch('/api' + this.props.match.url + '/' + orderBy, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      this.setState({users: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  toggle_type(e) {
    if (e.target.name == 0) {
      this.setState({redirect: true})
    }
  }

  toggleOrder(index) {
    this.setState({orderBy: index})
    this.fetchFollowing(index)
  }

  render() {
    var renderedUsers = [];
    if (this.state.users) {
      renderedUsers = this.state.users.map((item, index) => {
        return (
          <ProfileHover key={index} classStyle="followers_profile" username={item.username} profileName={item.profileName}
            profile_image_src={item.profile_image_src} />
        )
      });
    }
    if (this.state.redirect) {
      return (
        <Redirect to={'/' + this.props.match.params.profile + '/followers'} />
      )
    }
    return (
      <div id="white_background_wrapper">
        <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["Followers", "Following"]}
        type_selector_value={1} right={
          <Dropdown id="followers dropdown" className="time_period_dropdown" pullRight={true}>
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
