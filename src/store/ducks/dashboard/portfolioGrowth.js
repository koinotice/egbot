import { put, takeLatest, call, select } from 'redux-saga/effects';
import uniq from 'lodash/uniq';
import { getPortfolioGrowth } from '../../../api/private/portfolio';
import { getPriceInPrefCurrency } from '../../../utils/helpers';
import logger from '../../../utils/logger';

const initialState = {
  portfolioGrowth: [],
  historicalAllocations: [],
  portfolioGrowthLoaded: false,
  portfolioGrowthTimeFrame: 7
};

/* *********************************************** Actions *********************************************** */

const FETCH_PORTFOLIO_GROWTH = 'global/FETCH_PORTFOLIO_GROWTH';
const SET_PORTFOLIO_GROWTH = 'global/SET_PORTFOLIO_GROWTH';
const SET_PORTFOLIO_GROWTH_TIMEFRAME = 'global/SET_PORTFOLIO_GROWTH_TIMEFRAME';

/* ******************************************* Actions Creators ****************************************** */

function fetchPortfolioGrowth() {
  return {
    type: FETCH_PORTFOLIO_GROWTH,
  };
}

function setPortfolioGrowth(data) {
  return {
    type: SET_PORTFOLIO_GROWTH,
    data
  };
}

function setPortfolioGrowthTimeFrame(data) {
  return {
    type: SET_PORTFOLIO_GROWTH_TIMEFRAME,
    data
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_PORTFOLIO_GROWTH:
      return {
        ...state,
        portfolioGrowth: action.data.portfolioGrowth,
        historicalAllocations: action.data.historicalAllocations,
        portfolioGrowthLoaded: true
      };
    case SET_PORTFOLIO_GROWTH_TIMEFRAME:
      return {
        ...state,
        portfolioGrowthTimeFrame: action.data,
        portfolioGrowthLoaded: false
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function formatPortfolioGrowth(data, prefCurrency, forex, prices) {
  return data.map((d) => {
    const formattedData = {
      value: [parseInt(d.ts, 10), d.value]
    };
    if (prefCurrency !== 'BTC') {
      formattedData.value[1] *= getPriceInPrefCurrency('BTC', prefCurrency, prices, forex, false, d.btcusd);
    }
    return formattedData;
  });
}

function getAllHistoricalAssets(data) {
  return uniq(data.reduce((acc, d) => {
    d.assets.forEach((a) => {
      acc.push(a.asset);
    });
    return acc;
  }, []));
}

function formatHistoricalAllocations(data) {
  const uniqAssets = getAllHistoricalAssets(data);
  const seriesArray = [];
  uniqAssets.forEach((a) => {
    const assetSeries = [];
    data.forEach((dataTick) => {
      const portfolioValue = dataTick.assets.reduce((acc, asset) => {
        return acc + asset.value;
      }, 0);
      const assetObj = dataTick.assets.find(asset => asset.asset === a);
      const formattedData = {
        value: [
          parseInt(dataTick.ts, 10),
          assetObj ? (assetObj.value / portfolioValue) * 100 : 0],
        total: assetObj ? assetObj.total : 0,
        name: a,
      };
      assetSeries.push(formattedData);
    });
    seriesArray.push(assetSeries);
  });
  return seriesArray.sort((a, b) => a[0].value[1] - b[0].value[1]); // sort series by asset values in the latest tick
}

function* fetchPortfolioGrowthWorker() {
  const state = yield select();
  const { portfolioGrowthTimeFrame } = state.dashboard.portfolioGrowth;
  const { currentAccountId } = state.trade.interactions;
  const { pref_currency: prefCurrency } = state.global.user.user.preferences;
  const { prices, pricesLoaded } = state.global.prices;
  const { forex, forexLoaded } = state.global.forex;

  if (!forexLoaded || !pricesLoaded) return;

  const portfolioGrowth = yield call(getPortfolioGrowth, portfolioGrowthTimeFrame, currentAccountId);
  if (portfolioGrowth.error) {
    logger.error('Error fetching portfolioGrowth:', portfolioGrowth.error);
    return;
  }
  const formattedGrowth = formatPortfolioGrowth(portfolioGrowth, prefCurrency, forex, prices);
  const formattedHistoricalAllocations = formatHistoricalAllocations(portfolioGrowth);
  yield put(setPortfolioGrowth({ portfolioGrowth: formattedGrowth, historicalAllocations: formattedHistoricalAllocations }));
}

function* fetchPortfolioGrowthWatcher() {
  yield takeLatest(FETCH_PORTFOLIO_GROWTH, fetchPortfolioGrowthWorker);
}

/* ******************************************************************************************************* */

export { // action creators
  fetchPortfolioGrowth,
  setPortfolioGrowthTimeFrame
};
export const sagas = [
  fetchPortfolioGrowthWatcher,
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/dashboard/portfolioGrowth.js