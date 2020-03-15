import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import sessionStorage from 'redux-persist/lib/storage/session';
import bots, { sagas as botsSagas } from './bots';
import ticker, { sagas as tickerSagas } from './ticker';

const botsPersistConfig = {
  key: 'bots',
  storage: sessionStorage,
  whitelist: ['filterBotConfigType', 'filterBotConfigStatus']
};

const botsReducers = combineReducers({
  bots: persistReducer(botsPersistConfig, bots),
  ticker
});

const sagas = [
  ...botsSagas,
  ...tickerSagas
];

export default botsReducers;
export { sagas };



// WEBPACK FOOTER //
// ./src/store/ducks/algos/index.js