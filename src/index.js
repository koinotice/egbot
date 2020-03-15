import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import Router from './router';
import registerServiceWorker from './registerServiceWorker';
import data from './store/store';
import { getSessionToken } from './utils/token';

const AUTHENTICATED_ROUTES = ['settings'];

const sessionToken = getSessionToken();
if (!sessionToken) {
    // eslint-disable-next-line no-restricted-globals
  const { pathname } = location;
  const route = pathname.split('/')[2];
  if (AUTHENTICATED_ROUTES.includes(route)) {
      // eslint-disable-next-line no-restricted-globals
    location.replace(`/login?redirect=${pathname}`);
  }
}

ReactDOM.render(
  <Provider store={ data.store }>
    <PersistGate loading={ null } persistor={ data.persistor }>
      <Router />
    </PersistGate>
  </Provider>,
  document.querySelector('#root')
);
registerServiceWorker();



// WEBPACK FOOTER //
// ./src/index.js