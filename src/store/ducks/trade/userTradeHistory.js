import { takeEvery, call, put, select } from 'redux-saga/effects';
import { getAllTrades, syncAndGetTradesFor, getTradesBy } from '../../../api/private/trades';
import logger from '../../../utils/logger';

const initialState = {
  userTradesHistory: [],
  isLoaded: false,
};

/* *********************************************** Actions *********************************************** */

const FETCH_USER_TRADE_HISTORY = 'trade/FETCH_USER_TRADE_HISTORY';
const SYNC_FETCH_USER_TRADE_HISTORY = 'trade/SYNC_FETCH_USER_TRADE_HISTORY';
const FETCH_USER_TRADE_HISTORY_COMPLETE = 'trade/FETCH_USER_TRADE_HISTORY_COMPLETE';


/* ******************************************* Actions Creators ****************************************** */

function fetchUserTradeHistory() {
  return {
    type: FETCH_USER_TRADE_HISTORY,
  };
}

function syncAndFetchUserTradeHistory() {
  return {
    type: SYNC_FETCH_USER_TRADE_HISTORY,
  };
}

function fetchUserTradeHistoryComplete(userTradesHistory) {
  return {
    type: FETCH_USER_TRADE_HISTORY_COMPLETE,
    userTradesHistory,
  };
}


/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case FETCH_USER_TRADE_HISTORY_COMPLETE:
      return {
        ...state,
        userTradesHistory: action.userTradesHistory,
        isLoaded: true,
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */


function handleTradesResponse(currentTradeHistory, tradeResponse, accountId) {
  if (tradeResponse && tradeResponse.error) {
    logger.error('error getting trade history data');
    return currentTradeHistory;
  }

  return tradeResponse.map((trade) => {
    return {
      id: trade.tradeid,
      accountId: trade.accountid ? trade.accountid : accountId,
      exchange: trade.exchange,
      pair: trade.pair,
      side: trade.side.toUpperCase(),
      price: trade.price,
      fee: trade.fee.cost,
      feeCurrency: trade.fee.currency,
      amount: trade.amount,
      timestamp: trade.e_timestamp,
    };
  });
}

function* fetchUserTradeHistoryWorker() {
  const state = yield select();
  const { userTradesHistory } = state.trade.userTradeHistory;
  const { currentAccountId } = state.trade.interactions;

  const tradeResponse = currentAccountId ? yield call(getTradesBy, currentAccountId) : yield call(getAllTrades);

  const formattedResponse = handleTradesResponse(userTradesHistory, tradeResponse, currentAccountId);
  yield put(fetchUserTradeHistoryComplete(formattedResponse));
}

function* fetchUserTradeHistoryWatcher() {
  yield takeEvery(FETCH_USER_TRADE_HISTORY, fetchUserTradeHistoryWorker);
}

function* syncAndFetchUserTradeHistoryWorker() {
  const state = yield select();
  const { currentAccountId } = state.trade.interactions;
  const { userTradesHistory } = state.trade.userTradeHistory;

  if (!currentAccountId) {
    return;
  }

  const { currentPair } = state.trade.interactions;
  const tradeResponse = yield call(syncAndGetTradesFor, currentAccountId, currentPair);
  const formattedResponse = handleTradesResponse(userTradesHistory, tradeResponse);
  yield put(fetchUserTradeHistoryComplete(formattedResponse));
}

function* syncAndFetchUserTradeHistoryWatcher() {
  yield takeEvery(SYNC_FETCH_USER_TRADE_HISTORY, syncAndFetchUserTradeHistoryWorker);
}


/* ******************************************************************************************************* */

export { fetchUserTradeHistory, syncAndFetchUserTradeHistory };

export const sagas = [
  fetchUserTradeHistoryWatcher,
  syncAndFetchUserTradeHistoryWatcher,
];

export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/trade/userTradeHistory.js