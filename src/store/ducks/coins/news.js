import { takeEvery, call, put } from 'redux-saga/effects';
import { getNewsForSymbol } from '../../../api/public/news';
import logger from '../../../utils/logger';

const initialState = {
  news: [],
  newsLoaded: false
};

/* *********************************************** Actions *********************************************** */

const FETCH_NEWS_FOR_COIN = 'coins/FETCH_NEWS_FOR_COIN';
const SET_NEWS_FOR_COIN = 'coins/SET_NEWS_FOR_COIN';
const CLEAR_NEWS_FOR_COIN = 'coins/CLEAR_NEWS_FOR_COIN';

/* ******************************************* Actions Creators ****************************************** */

function fetchNewsForCoin(symbol) {
  return {
    type: FETCH_NEWS_FOR_COIN,
    symbol
  };
}

function setNewsForCoin(news) {
  return {
    type: SET_NEWS_FOR_COIN,
    news
  };
}

function clearNewsForCoin() {
  return {
    type: CLEAR_NEWS_FOR_COIN
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_NEWS_FOR_COIN:
      return {
        ...state,
        news: action.news,
        newsLoaded: true
      };
    case CLEAR_NEWS_FOR_COIN:
      return initialState;
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* fetchNewsForCoinWorker(action) {
  const { symbol } = action;
  const news = yield call(getNewsForSymbol, symbol);
  if (news.error) {
    logger.error(`Error getting news for ${symbol}: ${news.error}`);
    return;
  }
  yield put(setNewsForCoin(news));
}

function* fetchNewsForCoinWatcher() {
  yield takeEvery(FETCH_NEWS_FOR_COIN, fetchNewsForCoinWorker);
}

/* ******************************************************************************************************* */

export { fetchNewsForCoin, clearNewsForCoin };
export const sagas = [
  fetchNewsForCoinWatcher
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/coins/news.js