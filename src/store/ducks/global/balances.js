import { put, takeLatest, call } from 'redux-saga/effects';
import { getBalances } from '../../../api/private/balances';
import { refreshHoldings } from '../holdings/holdings';
import logger from '../../../utils/logger';

const initialState = {
  balances: [],
  balancesLoaded: false
};

/* *********************************************** Actions *********************************************** */

const FETCH_BALANCES = 'global/FETCH_BALANCES';
const SET_BALANCES = 'global/SET_BALANCES';


/* ******************************************* Actions Creators ****************************************** */

function fetchBalances() {
  return {
    type: FETCH_BALANCES,
  };
}

function setBalances(data) {
  return {
    type: SET_BALANCES,
    data
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_BALANCES:
      return {
        ...state,
        balances: action.data,
        balancesLoaded: true
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* fetchBalancesWorker() {
  const balances = yield call(getBalances, true);
  if (balances.error) {
    logger.error('Error fetching balances:', balances.error);
    return;
  }

  yield put(setBalances(balances));
  yield put(refreshHoldings());
}

function* fetchBalancesWatcher() {
  yield takeLatest(FETCH_BALANCES, fetchBalancesWorker);
}

/* ******************************************************************************************************* */

export { // action creators
  fetchBalances,
};
export const sagas = [
  fetchBalancesWatcher,
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/global/balances.js