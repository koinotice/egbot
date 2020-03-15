import { put, takeLatest, takeEvery, select, all } from 'redux-saga/effects';
import { unsubscribeOrderBook, subscribeOrderBook } from './orderBook';
import { unsubscribeBalanceStream, fetchBalances, setBalancesLoading } from './pairBalances';
import { unsubscribeTicker } from './ticker';
import { clearOrderForm, ORDER_TYPES } from './orderForm';
import { subscribeTradeHistory, unsubscribeTradeHistory } from './tradeHistory';
import { fetchExchangeMarkets } from './markets';
import { ACCOUNT_TYPES } from '../../../utils/types';

const initialState = {
  currentExchange: '',
  currentAccountId: '',
  currentPair: '',
  currentMarket: '',
  accountFilter: true,
  pairFilter: true,
};

/* *********************************************** Actions *********************************************** */
const INIT_TRADE_SCREEN = 'trade/INIT_TRADE_SCREEN';
const UPDATE_CURRENT_EXCHANGE = 'trade/UPDATE_CURRENT_EXCHANGE';
const UPDATE_CURRENT_ACCOUNT = 'trade/UPDATE_CURRENT_ACCOUNT';
const UPDATE_CURRENT_PAIR = 'trade/UPDATE_CURRENT_PAIR';
const UPDATE_CURRENT_MARKET = 'trade/UPDATE_CURRENT_MARKET';
const UPDATE_ACCOUNT_FILTER = 'trade/UPDATE_ACCOUNT_FILTER';
const UPDATE_PAIR_FILTER = 'trade/UPDATE_PAIR_FILTER';
const UNSUBSCRIBE_ALL_STREAMS = 'trade/UNSUBSCRIBE_ALL_STREAMS';
const RESUBSCRIBE_ALL_STREAMS = 'trade/RESUBSCRIBE_ALL_STREAMS';

/* ******************************************* Actions Creators ****************************************** */

function initTradeScreen() {
  return {
    type: INIT_TRADE_SCREEN,
  };
}

function updateExchange(data) {
  return {
    type: UPDATE_CURRENT_EXCHANGE,
    data
  };
}

function updateAccount(data) {
  return {
    type: UPDATE_CURRENT_ACCOUNT,
    data
  };
}

function updatePair(data) {
  return {
    type: UPDATE_CURRENT_PAIR,
    data
  };
}

function updateAccountFilter(data) {
  return {
    type: UPDATE_ACCOUNT_FILTER,
    data
  };
}

function updatePairFilter(data) {
  return {
    type: UPDATE_PAIR_FILTER,
    data
  };
}


function updateMarket(data) {
  return {
    type: UPDATE_CURRENT_MARKET,
    data
  };
}

function unsubscribeAllStreams() {
  return {
    type: UNSUBSCRIBE_ALL_STREAMS,
  };
}

function resubscribeAllStreams() {
  return {
    type: RESUBSCRIBE_ALL_STREAMS,
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case UPDATE_CURRENT_EXCHANGE:
      return {
        ...state,
        currentExchange: action.data
      };
    case UPDATE_CURRENT_ACCOUNT:
      return {
        ...state,
        currentAccountId: action.data
      };
    case UPDATE_CURRENT_PAIR:
      return {
        ...state,
        currentPair: action.data
      };
    case UPDATE_CURRENT_MARKET:
      return {
        ...state,
        currentMarket: action.data
      };
    case UPDATE_ACCOUNT_FILTER:
      return {
        ...state,
        accountFilter: action.data
      };
    case UPDATE_PAIR_FILTER:
      return {
        ...state,
        pairFilter: action.data
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function getFirstAccountForExchange(exchange, accounts) {
  return (accounts.length && exchange) ? accounts.find(acc => acc.name === exchange) : false;
}

function* unsubscribeAllStreamWorker() {
  const state = yield select();
  const { currentAccountId } = state.trade.interactions;

  if (currentAccountId) {
    yield all([
      put(unsubscribeBalanceStream()),
    ]);
  }
  yield all([
    put(unsubscribeTradeHistory()),
    put(unsubscribeOrderBook()),
    put(unsubscribeTicker()),
  ]);
}

function* unsubscribeAllStreamWatcher() {
  yield takeEvery(UNSUBSCRIBE_ALL_STREAMS, unsubscribeAllStreamWorker);
}

function* resubscribeAllStreamWorker() {
  const state = yield select();
  const { currentAccountId } = state.trade.interactions;

  yield put(fetchExchangeMarkets());
  if (currentAccountId) {
    yield all([
      put(fetchBalances()),
    ]);
  }
}

function* resubscribeAllStreamWatcher() {
  yield takeEvery(RESUBSCRIBE_ALL_STREAMS, resubscribeAllStreamWorker);
}

function* updateExchangeWorker() {
  yield put(fetchExchangeMarkets());
  const state = yield select();
  const { currentExchange } = state.trade.interactions;
  yield put(unsubscribeAllStreams());
  const { accounts } = state.global.accounts;
  if (accounts.length) {
    const firstAccountFromExchange = getFirstAccountForExchange(currentExchange, accounts);
    if (firstAccountFromExchange) {
      yield put(updateAccount(firstAccountFromExchange.id));
    } else {
      yield put(updateAccount(''));
    }
  }
}

function* updateExchangeWatcher() {
  yield takeEvery(UPDATE_CURRENT_EXCHANGE, updateExchangeWorker);
}

function* updateAccountWorker() {
  const state = yield select();
  const { currentAccountId, currentExchange } = state.trade.interactions;
  const { accounts } = state.global.accounts;

  if (accounts.length && currentAccountId) {
    const currentAccountObj = accounts.filter(acc => acc.id === currentAccountId);
    if (currentAccountObj.length && currentAccountObj[0].name && currentAccountObj[0].name !== currentExchange) {
      yield put(updateExchange(currentAccountObj[0].name));
    }
    yield put(setBalancesLoading());
  }
  yield put(resubscribeAllStreams());
}

function* updateAccountWatcher() {
  yield takeLatest(UPDATE_CURRENT_ACCOUNT, updateAccountWorker);
}

function* updatePairWorker() {
  const state = yield select();
  const { currentPair, currentAccountId } = state.trade.interactions;

  const market = (currentPair.split('/'))[1];

  yield put(setBalancesLoading());

  yield all([
    put(unsubscribeOrderBook()),
    put(unsubscribeTradeHistory()),
    put(clearOrderForm()),
  ]);

  yield all([
    put(updateMarket(market)),
    put(subscribeOrderBook()),
    put(subscribeTradeHistory()),
  ]);

  if (currentAccountId) {
    const { exchanges } = state.global.exchanges;
    const { currentExchange } = state.trade.interactions;
    const { orderType } = state.trade.orderForm;
    const currentExchangeHasCurrentOrderType = exchanges[currentExchange].config.orderTypes.some(type => ORDER_TYPES[type] === orderType);
    const newOrderType = currentExchangeHasCurrentOrderType ? ORDER_TYPES.MARKET : ORDER_TYPES[exchanges[currentExchange].config.orderTypes[0]];

    yield all([
      put(fetchBalances()),
      put(clearOrderForm(newOrderType)),
    ]);
  }
}

function* updatePairWatcher() {
  yield takeLatest(UPDATE_CURRENT_PAIR, updatePairWorker);
}

function* initTradeScreenWorker() {
  const state = yield select();
  const { currentExchange, currentAccountId } = state.trade.interactions;
  const { accounts } = state.global.accounts;
  const accountExistsForExchange = getFirstAccountForExchange(currentExchange, accounts);

  const currentAccount = accounts.filter(acc => acc.id === currentAccountId);
  if (currentAccount.length && currentAccount[0].type.toUpperCase() !== ACCOUNT_TYPES.EXCHANGE) {
    const newAccountId = accountExistsForExchange ? accountExistsForExchange.id : '';
    yield put(updateAccount(newAccountId));
  }

  if (!currentExchange) {
    const { exchanges } = state.global.exchanges;
    yield put(updateExchange(Object.keys(exchanges)[0]));
  } else if (currentExchange && !currentAccountId && accountExistsForExchange) {
    yield put(updateExchange(currentExchange));
  } else {
    yield put(resubscribeAllStreams());
  }
}

function* initTradeScreenWatcher() {
  yield takeEvery(INIT_TRADE_SCREEN, initTradeScreenWorker);
}

/* ******************************************************************************************************* */

export { // action creators
  initTradeScreen,
  updateExchange,
  updateAccount,
  updateAccountFilter,
  updatePair,
  updatePairFilter,
  updateMarket,
  unsubscribeAllStreams,
  resubscribeAllStreams,
};
export const sagas = [
  initTradeScreenWatcher,
  updateExchangeWatcher,
  updateAccountWatcher,
  updatePairWatcher,
  unsubscribeAllStreamWatcher,
  resubscribeAllStreamWatcher,
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/trade/interactions.js