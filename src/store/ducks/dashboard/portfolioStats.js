import { put, takeLatest, call, select } from 'redux-saga/effects';
import { getPortfolioStats } from '../../../api/private/portfolio';
import logger from '../../../utils/logger';

const initialState = {
  totalOrders: 0,
  mostTradedPair: '',
  ordersByDate: [],
  statsLoaded: false,
};

/* *********************************************** Actions *********************************************** */

const FETCH_PORTFOLIO_STATS = 'global/FETCH_PORTFOLIO_STATS';
const SET_PORTFOLIO_STATS = 'global/SET_PORTFOLIO_STATS';

/* ******************************************* Actions Creators ****************************************** */

function fetchPortfolioStats() {
  return {
    type: FETCH_PORTFOLIO_STATS,
  };
}

function setPortfolioGrowth(data) {
  return {
    type: SET_PORTFOLIO_STATS,
    data
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_PORTFOLIO_STATS:
      return {
        ...state,
        totalOrders: action.data.totalOrders,
        mostTradedPair: action.data.mostTradedPair,
        ordersByDate: action.data.ordersByDate,
        statsLoaded: true
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* fetchPortfolioStatsWorker() {
  const state = yield select();
  const { currentAccountId } = state.trade.interactions;
  const portfolioStats = yield call(getPortfolioStats, currentAccountId);
  if (portfolioStats.error) {
    logger.error('Error fetching portfolio stats:', portfolioStats.error);
    return;
  }

  yield put(setPortfolioGrowth(portfolioStats));
}

function* fetchPortfolioStatsWatcher() {
  yield takeLatest(FETCH_PORTFOLIO_STATS, fetchPortfolioStatsWorker);
}

/* ******************************************************************************************************* */

export { // action creators
  fetchPortfolioStats,
};
export const sagas = [
  fetchPortfolioStatsWatcher,
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/dashboard/portfolioStats.js