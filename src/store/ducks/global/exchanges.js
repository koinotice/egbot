import { put, takeLatest, call } from 'redux-saga/effects';
import getExchangeInfo from '../../../api/private/exchanges';
import logger from '../../../utils/logger';

const initialState = {
  exchanges: {},
  exchangesLoaded: false
};

/* *********************************************** Actions *********************************************** */
const FETCH_EXCHANGES = 'global/FETCH_EXCHANGES';
const SET_EXCHANGES = 'global/SET_EXCHANGES';


/* ******************************************* Actions Creators ****************************************** */

function fetchExchanges() {
  return {
    type: FETCH_EXCHANGES,
  };
}

function setExchanges(data) {
  return {
    type: SET_EXCHANGES,
    data
  };
}


/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  const { data } = action;
  switch (action.type) {
    case SET_EXCHANGES:
      return {
        ...state,
        exchanges: data,
        exchangesLoaded: true
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* fetchExchangesWorker() {
  const exchanges = yield call(getExchangeInfo);
  if (exchanges.error) {
    logger.error('Error fetching exchanges:', exchanges.error);
    return;
  }

  yield put(setExchanges(exchanges));
}


function* fetchExchangesWatcher() {
  yield takeLatest(FETCH_EXCHANGES, fetchExchangesWorker);
}


/* ******************************************************************************************************* */

export { // action creators
  fetchExchanges,
};
export const sagas = [
  fetchExchangesWatcher,
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/global/exchanges.js