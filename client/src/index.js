import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import registerServiceWorker from './registerServiceWorker';
import RoutesComponent from './js/components/Routes.jsx'

// const Routes = () => (
//   <BrowserRouter>
//     <div>
//       <Switch>
//         <Route exact path='/' component={Stream}/>
//         <Route exact path='/upload' component={Upload}/>
//         <Route exact path='/home' component={Home}/>
//         <Route exact path='/finder' component={Outfit_Finder}/>
//         <Route exact path='/search' component={Search}/>
//         <Route exact path='/you/collections' component={Collections} />
//         <Route exact path='/you/stats' component={Stats} />
//         <Route exact path='/:profile' component={Profile}/>
//         <Route exact path='/:profile/:mediaId' component={SinglePostPage}/>
//         <Route exact path='/:profile/playlist/:playlistId' component={SinglePlaylistPage}/>
//         <Route exact path='/:profile/playlists/:playlistId' component={Playlist}/>
//       </Switch>
//     </div>
//   </BrowserRouter>
// );


ReactDOM.render(
  <RoutesComponent/>,
  document.getElementById('root')
);
registerServiceWorker();
