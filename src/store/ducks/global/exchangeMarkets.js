import { put, takeLatest, call, all, select } from 'redux-saga/effects';
import getMarketsFor from '../../../api/public/exchanges';
import logger from '../../../utils/logger';
import { ACCOUNT_TYPES } from '../../../utils/types';

const initialState = {
  markets: {},
  marketsLoaded: false
};

/* *********************************************** Actions *********************************************** */

const FETCH_MARKETS = 'global/FETCH_MARKETS';
const SET_MARKETS = 'global/SET_MARKETS';
const SET_LOADED = 'global/SET_LOADED';


/* ******************************************* Actions Creators ****************************************** */

function fetchMarkets() {
  return {
    type: FETCH_MARKETS,
  };
}

function setMarkets(exchange, markets) {
  return {
    type: SET_MARKETS,
    data: {
      [exchange]: markets
    }
  };
}


function setLoaded() {
  return {
    type: SET_LOADED,
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  const { data } = action;
  switch (action.type) {
    case SET_MARKETS:
      return {
        ...state,
        markets: {
          ...state.markets,
          ...data
        },
      };
    case SET_LOADED:
      return {
        ...state,
        marketsLoaded: true
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* getMarkets(exchange) {
  const markets = yield call(getMarketsFor, exchange);
  if (markets.error) {
    logger.error(`Error fetching markets ${markets.error}`);
    return;
  }
  yield put(setMarkets(exchange, markets));
}

function* fetchMarketsWorker() {
  const state = yield select();
  const { accounts } = state.global.accounts;
  yield all(accounts.filter(acc => acc.type.toUpperCase() === ACCOUNT_TYPES.EXCHANGE).map(account => getMarkets(account.name)));
  yield put(setLoaded());
}

function* fetchMarketsWatcher() {
  yield takeLatest(FETCH_MARKETS, fetchMarketsWorker);
}

/* ******************************************************************************************************* */

export { // action creators
  fetchMarkets,
};
export const sagas = [
  fetchMarketsWatcher,
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/global/exchangeMarkets.js