import { takeLatest, call, put, select } from 'redux-saga/effects';
import getMarketsFor from '../../../api/public/exchanges';
import { initTicker } from './ticker';
import logger from '../../../utils/logger';


const initialState = {
  exchangeMarketsData: {},
  sortType: '',
  sortOrder: true
};

/* *********************************************** Actions *********************************************** */

const FETCH_EXCHANGE_MARKETS = 'trade/FETCH_EXCHANGE_MARKETS';
const SET_EXCHANGE_MARKETS = 'trade/SET_EXCHANGE_MARKETS';
const SET_EXCHANGE_MARKETS_SORT = 'trade/SET_EXCHANGE_MARKETS_SORT';

/* ******************************************* Actions Creators ****************************************** */

function fetchExchangeMarkets() {
  return {
    type: FETCH_EXCHANGE_MARKETS,
  };
}

function setExchangeMarkets(exchangeMarketsData) {
  return {
    type: SET_EXCHANGE_MARKETS,
    exchangeMarketsData,
  };
}

function setExchangeMarketsSort(nextSortType) {
  return {
    type: SET_EXCHANGE_MARKETS_SORT,
    nextSortType,
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_EXCHANGE_MARKETS:
      return {
        ...state,
        exchangeMarketsData: action.exchangeMarketsData,
      };
    case SET_EXCHANGE_MARKETS_SORT:
      return {
        ...state,
        sortType: action.nextSortType,
        sortOrder: action.nextSortType === state.sortType ? !state.sortOrder : true
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* fetchExchangeMarketsWorker() {
  const state = yield select();
  const { currentExchange } = state.trade.interactions;

  if (currentExchange) {
    const exchangeMarkets = yield call(getMarketsFor, currentExchange);
    if (exchangeMarkets.error) {
      logger.error('error getting exchange markets');
      return;
    }
    yield put(setExchangeMarkets(exchangeMarkets));
    yield put(initTicker());
  }
}

function* fetchExchangeMarketsWatcher() {
  yield takeLatest(FETCH_EXCHANGE_MARKETS, fetchExchangeMarketsWorker);
}

/* ******************************************************************************************************* */

export { fetchExchangeMarkets, setExchangeMarketsSort };

export const sagas = [
  fetchExchangeMarketsWatcher,
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/trade/markets.js