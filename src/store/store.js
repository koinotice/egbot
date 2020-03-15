import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistStore, persistReducer } from 'redux-persist';
import sessionStorage from 'redux-persist/lib/storage/session';
// import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import MIDDLEWARE from './middleware/middleware';
import logger from '../utils/logger';
import reducers, { rootSaga } from './ducks';


const tradePersistConfig = {
  key: 'trade',
  storage: sessionStorage,
  blacklist: [
    'accounts',
    'exchanges',
    'openOrders',
    'orderBook',
    'orderForm',
    'markets',
    'pairBalances',
    'ticker',
    'forex',
    'tradeHistory',
    'userTradeHistory',
  ],
};

function configureStore() {
  const allMiddleware = Object.values(MIDDLEWARE);

  const rootReducer = combineReducers({
    global: reducers.global,
    dashboard: reducers.dashboard,
    holdings: reducers.holdings,
    trade: persistReducer(tradePersistConfig, reducers.trade),
    news: reducers.news,
    coins: reducers.coins,
    referrals: reducers.referrals,
    algos: reducers.algos
  });

  const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(...allMiddleware))
  );

  MIDDLEWARE.sagaMiddleware.run(rootSaga);

  // Make reducers hot reloadable
  if (module.hot) {
    module.hot.accept('./ducks', () => {
      // eslint-disable-next-line global-require
      const nextReducer = require('./ducks');
      store.replaceReducer(combineReducers({ ...nextReducer }));
    });
  }

  const persistor = persistStore(store, null, () => {
    logger.debug('Store has been hydrated');
  });


  return { store, persistor };
}

export default configureStore();



// WEBPACK FOOTER //
// ./src/store/store.js