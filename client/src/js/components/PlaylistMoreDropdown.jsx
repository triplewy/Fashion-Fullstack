import React from 'react';
import PlaylistDeleteModal from './PlaylistDeleteModal.jsx'
import { Dropdown } from 'react-bootstrap'
import more_icon from 'images/more-icon.png'
import report_icon from 'images/report-icon.png'
import edit_icon from 'images/edit-icon.svg'


export default class PlaylistMoreDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const isPoster = this.props.playlist.isPoster
    return (
      <Dropdown id="more_dropdown" pullRight>
        <Dropdown.Toggle noCaret={true}>
          <div className="more_icon" style={{backgroundImage: 'url(' + more_icon + ')'}} />
        </Dropdown.Toggle>
        <Dropdown.Menu className="more_dropdown_menu">
          <li>
            <div style={{backgroundImage: 'url(' + report_icon + ')'}} />
            <p>Report</p>
          </li>
          {isPoster ?
            <li>
              <div style={{backgroundImage: 'url(' + edit_icon + ')'}} />
              <p>Edit</p>
            </li>
            :
            null
          }
          {isPoster ?
            <PlaylistDeleteModal playlistId={this.props.playlist.playlistId} />
            :
            null
          }
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
