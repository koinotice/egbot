import { combineReducers } from 'redux';
import user, { sagas as userSagas } from './user';
import accounts, { sagas as accountsSagas } from './accounts';
import balances, { sagas as balancesSagas } from './balances';
import exchanges, { sagas as exchangesSagas } from './exchanges';
import markets, { sagas as exchangeMarketsSagas } from './exchangeMarkets';
import forex, { sagas as forexSagas } from './forex';
import prices, { sagas as pricesSagas } from './prices';
import notifications from './notifications';
import orders, { sagas as ordersSagas } from './orders';
import paywall, { sagas as paywallSagas } from './paywall';

const globalReducers = combineReducers({
  user,
  accounts,
  balances,
  exchanges,
  markets,
  forex,
  prices,
  notifications,
  orders,
  paywall,
});

const sagas = [
  ...userSagas,
  ...accountsSagas,
  ...balancesSagas,
  ...exchangesSagas,
  ...exchangeMarketsSagas,
  ...forexSagas,
  ...pricesSagas,
  ...ordersSagas,
  ...paywallSagas,
];

export default globalReducers;
export { sagas };



// WEBPACK FOOTER //
// ./src/store/ducks/global/index.js