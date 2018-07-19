import React from 'react';
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import Dropzone from 'react-dropzone'
import {Modal} from 'react-bootstrap';


import Home from './Home.jsx';
import Stream from './Stream.jsx';
import Profile from './Profile.jsx';
import SinglePostPage from './SinglePostPage.jsx'
import SinglePlaylistPage from './SinglePlaylistPage.jsx'
import Collections from './Collections.jsx'
import Upload from './Upload.jsx'
import Outfit_Finder from './OutfitFinder.jsx'
import Search from './Search.jsx'
import Playlist from './Playlist.jsx'
import Stats from './Stats.jsx'

class Routes extends React.Component {
  constructor() {
    super()
    this.state = {
      files: [],
      dropzoneActive: false,
      redirect: false
    }

    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  onDragEnter() {
    console.log("we in here");
    this.setState({dropzoneActive: true, redirect: false});
  }

  onDragLeave() {
    console.log("we not in here");
    this.setState({dropzoneActive: false, redirect: false});
  }

  onDrop(accepted, rejected) {
    console.log("files dropped", accepted);
    if (accepted) {
      this.setState({files: accepted, dropzoneActive: false, redirect: true});
    }
  }

  render() {
    const { files, dropzoneActive } = this.state;
    return (
      <BrowserRouter>
        <div>
          <Dropzone
              disableClick
              accept={['image/jpg', 'image/png', 'image/jpeg']}
              style={{position: "absolute", width: '100%'}}
              multiple={false}
              onDrop={this.onDrop}
              onDragEnter={this.onDragEnter}
          >
            <Modal show={this.state.dropzoneActive} onDragLeave={this.onDragLeave} style={{'pointerEvents': 'none', 'width': '90%', 'height': '90%'}}>
              <Modal.Header closeButton>
                <Modal.Title>Modal heading</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div>Modal content here </div>
              </Modal.Body>
            </Modal>
            {this.state.redirect && <Redirect to={{pathname: '/upload', state: {files: this.state.files}}} />}
            <Switch>
              <Route exact path='/' component={Stream}/>
              <Route exact path='/upload' component={Upload}/>
              <Route exact path='/home' component={Home}/>
              <Route exact path='/finder' component={Outfit_Finder}/>
              <Route exact path='/search' component={Search}/>
              <Route exact path='/you/collections' component={Collections} />
              <Route exact path='/you/stats' component={Stats} />
              <Route exact path='/:profile' component={Profile}/>
              <Route exact path='/:profile/:mediaId' component={SinglePostPage}/>
              <Route exact path='/:profile/playlist/:playlistId' component={SinglePlaylistPage}/>
              <Route exact path='/:profile/playlists/:playlistId' component={Playlist}/>
            </Switch>
          </Dropzone>
        </div>
      </BrowserRouter>
    )
  }
}

export default Routes;
