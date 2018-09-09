import React from 'react';
import DropdownProfile from './DropdownProfile.jsx'
import StatsHeader from './StatsHeader.jsx'
import image1 from 'images/testImages/image1.jpg'
import { Link } from 'react-router-dom'


export default class ImageTetris extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entered: false
    };

    this.setEntered = this.setEntered.bind(this)
    this.setLeft = this.setLeft.bind(this)
  }

  componentDidMount() {

  }

  setEntered(e) {
    console.log("yoo");
    if (!this.state.entered) {
      this.setState({entered: true})
    }
  }

  setLeft(e) {
    if (this.state.entered) {
      this.setState({entered: false})
    }
  }

  render() {
    const imageUrl = require(`images/testImages/image1.jpg`)
    return (
      <div className="tetris_block_wrapper" onMouseEnter={this.setEntered} onMouseLeave={this.setLeft}>
        <div className="tetris_image" style={{backgroundImage: 'url(' + require('images/testImages/image1.jpg') + ')' }} />
        {this.state.entered &&
          <div className="block_profile">
            <div className="post_profile_link">
              <Link to={"/" + this.props.username} onMouseEnter={this.setLoadHoverData}>
                <div id="profile_image_div">
                  <img id="profile_image" alt="" src={this.props.imageUrl}></img>
                </div>
                <strong id="user_name">Takashi</strong>
              </Link>
              <DropdownProfile username={this.props.username} load={this.state.loadHoverData}/>
            </div>
          </div>
        }
        {this.state.entered &&
          <div className="block_stats">
            <StatsHeader />
          </div>
        }
      </div>
    );
  }
}
