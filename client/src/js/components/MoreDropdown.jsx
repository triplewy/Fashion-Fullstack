import React from 'react';
import DeleteModal from './DeleteModal.jsx'
import EditPostModal from './EditPostModal.jsx'
import ReportPostModal from './ReportPostModal.jsx'
import { Dropdown } from 'react-bootstrap'
import more_icon from 'images/more-icon.png'

export default class MoreDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  }

  render() {
    const isPoster = this.props.post.isPoster
    return (
      <Dropdown id="more_dropdown" pullRight>
        <Dropdown.Toggle noCaret={true}>
          <div className="more_icon" style={{backgroundImage: 'url(' + more_icon + ')'}} />
        </Dropdown.Toggle>
        <Dropdown.Menu className="more_dropdown_menu">
          <ReportPostModal post={this.props.post} />
          {isPoster ?
            <EditPostModal
              post={this.props.post}
              SinglePostPage={this.props.SinglePostPage} 
            />
            :
            null
          }
          {isPoster ?
            <DeleteModal mediaId={this.props.post.mediaId} />
            :
            null
          }
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
