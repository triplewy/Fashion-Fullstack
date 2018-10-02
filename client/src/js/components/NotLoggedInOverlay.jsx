import React from 'react';
import { Overlay, Tooltip } from 'react-bootstrap'

export default class NotLoggedInOverlay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  }

  render() {
    return (
      <Overlay
        show={this.props.showOverlay}
        placement="bottom"
        target={this.props.target}
      >
        <Tooltip id="tooltip" className="tooltip" >Please log in</Tooltip>
      </Overlay>

    )
  }
}
