import React from 'react';
import DropdownProfile from './DropdownProfile.jsx'
import { Link } from 'react-router-dom';

export default class ProfileHover extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadHoverData: false
    };

    this.setLoadHoverData = this.setLoadHoverData.bind(this)
  }

  setLoadHoverData(e) {
    this.setState({loadHoverData: true})
  }

  render() {
    return (
      <div className={this.props.classStyle}>
        <Link to={"/" + this.props.username} onMouseEnter={this.setLoadHoverData}>
          {this.props.profile_image_src &&
            <img alt="" src={this.props.profile_image_src}></img>
          }
          <strong>{this.props.profileName}</strong>
        </Link>
        <DropdownProfile username={this.props.username} load={this.state.loadHoverData}/>
      </div>
    );
  }
}
