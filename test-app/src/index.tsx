import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'

import './index.css';
import App from './App';
import { initStore } from './store'

import 'decentraland-ui/lib/styles.css'
import 'decentraland-ui/lib/dark-theme.css'


ReactDOM.render(
  <Provider store={initStore()}>
    <App />
  </Provider>,
  document.getElementById('root')
);
