import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import sessionStorage from 'redux-persist/lib/storage/session';
import tradeHistory, { sagas as tradeHistorySagas } from './tradeHistory';
import orderBook, { sagas as orderBookSagas } from './orderBook';
import orderForm, { sagas as orderFormSagas } from './orderForm';
import userTradeHistory, { sagas as userTradeHistorySagas } from './userTradeHistory';
import transactionHistory, { sagas as transactionHistorySagas } from './transactionHistory';
import ticker, { sagas as tickerSagas } from './ticker';
import pairBalances, { sagas as pairBalancesSagas } from './pairBalances';
import interactions, { sagas as interactionsSagas } from './interactions';
import markets, { sagas as marketsSagas } from './markets';

const marketsPersistConfig = {
  key: 'markets',
  storage: sessionStorage,
  blacklist: ['exchangeMarketsData']
};

const tradeReducers = combineReducers({
  tradeHistory,
  transactionHistory,
  orderBook,
  orderForm,
  userTradeHistory,
  ticker,
  pairBalances,
  interactions,
  markets: persistReducer(marketsPersistConfig, markets),
});

const sagas = [
  ...tradeHistorySagas,
  ...transactionHistorySagas,
  ...orderBookSagas,
  ...orderFormSagas,
  ...userTradeHistorySagas,
  ...tickerSagas,
  ...pairBalancesSagas,
  ...interactionsSagas,
  ...marketsSagas,
];

export default tradeReducers;
export { sagas };



// WEBPACK FOOTER //
// ./src/store/ducks/trade/index.js