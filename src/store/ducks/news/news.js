import { takeEvery, call, put } from 'redux-saga/effects';
import { getNews } from '../../../api/public/news';
import logger from '../../../utils/logger';


const initialState = {
  newItems: [],
  newItemsLoaded: false,
};


/* *********************************************** Actions *********************************************** */

const FETCH_NEWS_ITEMS = 'global/FETCH_NEWS_ITEMS';
const SET_NEWS_ITEMS = 'global/SET_NEWS_ITEMS';

/* ******************************************* Actions Creators ****************************************** */

function fetchNews() {
  return {
    type: FETCH_NEWS_ITEMS,
  };
}

function setNews(data) {
  return {
    type: SET_NEWS_ITEMS,
    data
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_NEWS_ITEMS:
      return {
        ...state,
        newItems: action.data,
        newItemsLoaded: true,
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* fetchNewsItemsWorker() {
  const newsItems = yield call(getNews);
  if (newsItems.error) {
    logger.error('Error fetching news:', newsItems.error);
    return;
  }
  yield put(setNews(newsItems));
}

function* fetchNewsItemsWatcher() {
  yield takeEvery(FETCH_NEWS_ITEMS, fetchNewsItemsWorker);
}

/* ******************************************************************************************************* */

export { fetchNews, };
export const sagas = [
  fetchNewsItemsWatcher,
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/news/news.js