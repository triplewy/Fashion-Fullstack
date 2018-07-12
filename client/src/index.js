import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import registerServiceWorker from './registerServiceWorker';
import {
  BrowserRouter,
  Route,
  Switch
} from 'react-router-dom';

import Home from './js/components/Home.jsx';
import Stream from './js/components/Stream.jsx';
import Profile from './js/components/Profile.jsx';
import SinglePostPage from './js/components/SinglePostPage.jsx'
import SinglePlaylistPage from './js/components/SinglePlaylistPage.jsx'
import Collections from './js/components/Collections.jsx'
import Upload from './js/components/Upload.jsx'
import Outfit_Finder from './js/components/OutfitFinder.jsx'
import Search from './js/components/Search.jsx'
import Playlist from './js/components/Playlist.jsx'
import Stats from './js/components/Stats.jsx'

const Routes = () => (
  <BrowserRouter>
    <div>
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
    </div>
  </BrowserRouter>
);

ReactDOM.render(
  <Routes/>,
  document.getElementById('root')
);
registerServiceWorker();
