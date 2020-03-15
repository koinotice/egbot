import { combineReducers } from 'redux';
import coins, { sagas as coinsSagas } from './coins';
import table, { sagas as tableSagas } from './table';
import summary, { sagas as summarySagas } from './summary';
import overview, { sagas as overviewSagas } from './overview';
import markets, { sagas as marketsSagas } from './markets';
import news, { sagas as newsSagas } from './news';

const coinsReducers = combineReducers({
  coins,
  table,
  summary,
  overview,
  markets,
  news
});

const sagas = [
  ...coinsSagas,
  ...tableSagas,
  ...summarySagas,
  ...overviewSagas,
  ...marketsSagas,
  ...newsSagas
];

export default coinsReducers;
export { sagas };



// WEBPACK FOOTER //
// ./src/store/ducks/coins/index.js