import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import registerServiceWorker from './registerServiceWorker';
import Routes from './js/components/Routes.jsx'

ReactDOM.render(
  <Routes />,
  document.getElementById('root')
);
registerServiceWorker();
