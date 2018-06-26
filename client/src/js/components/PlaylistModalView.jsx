import React from 'react';

export default class PlaylistModalView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    console.log("PlaylistModalView activated");
    return (
      <div id="myModal" className="modal fade">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 className="modal-title">Confirmation</h4>
                </div>
                <div className="modal-body">
                    <p>Do you want to save changes you made to document before closing?</p>
                    <p className="text-warning"><small>If you don't save, your changes will be lost.</small></p>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary">Save changes</button>
                </div>
            </div>
        </div>
    </div>
    );
  }
}
