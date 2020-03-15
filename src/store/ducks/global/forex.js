import { put, takeLatest, call } from 'redux-saga/effects';
import getForex from '../../../api/public/forex';
import logger from '../../../utils/logger';

const initialState = {
  forex: {},
  forexLoaded: false
};

/* *********************************************** Actions *********************************************** */

const FETCH_FOREX = 'global/FETCH_FOREX';
const SET_FOREX = 'global/SET_FOREX';


/* ******************************************* Actions Creators ****************************************** */

function fetchForex() {
  return {
    type: FETCH_FOREX,
  };
}

function setForex(data) {
  return {
    type: SET_FOREX,
    data
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_FOREX:
      return {
        ...state,
        forex: action.data,
        forexLoaded: true
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* fetchForexWorker() {
  const forex = yield call(getForex);
  if (forex.error) {
    logger.error('Error fetching forex:', forex.error);
    return;
  }

  yield put(setForex(forex));
}

function* fetchForexWatcher() {
  yield takeLatest(FETCH_FOREX, fetchForexWorker);
}

/* ******************************************************************************************************* */

export { // action creators
  fetchForex
};
export const sagas = [
  fetchForexWatcher,
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/global/forex.js