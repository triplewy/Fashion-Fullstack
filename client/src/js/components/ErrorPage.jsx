import React from 'react';
import { Jumbotron } from 'react-bootstrap'

export default class ErrorPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }

  }

  componentDidMount() {
    window.scrollTo(0, 0)

  }

  render() {
    return (
      <div id="white_background_wrapper">
        <Jumbotron>
          <p>Doesn't look like there's anything here</p>
        </Jumbotron>
      </div>
    )
  }
}
