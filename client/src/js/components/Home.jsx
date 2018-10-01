import React from 'react';
import Explore from './Explore.jsx'
import {Redirect} from 'react-router-dom';
import { Jumbotron } from 'react-bootstrap';

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {

  }

  render() {
    return (
      <div>
        <Jumbotron>
          <h1>drip.io</h1>
          <p>
            A social media platform catered for fashion
          </p>
        </Jumbotron>
        <Explore home toggleLoginModal={this.props.toggleLoginModal}/>
      </div>
    );
  }
}
