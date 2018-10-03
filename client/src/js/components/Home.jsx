import React from 'react';
import Explore from './Explore.jsx'
import ExplorePosts from './ExplorePosts.jsx'
import ExploreCollections from './ExploreCollections.jsx'
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
        <Jumbotron>
          <p>Introducing collections</p>
        </Jumbotron>
        <ExploreCollections />
        <Jumbotron>
          <p>And posts</p>
        </Jumbotron>
        <ExplorePosts />
        {/* <Explore home /> */}
      </div>
    );
  }
}
