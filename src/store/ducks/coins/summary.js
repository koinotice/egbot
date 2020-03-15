import { put, call, takeLatest, select } from 'redux-saga/effects';
import { getCoinInfo, getCoinsSummary } from '../../../api/public/coins';
import Logger from '../../../utils/logger';
import { getPriceInPrefCurrency, calcPercentChange, convertGivenUSDRate } from '../../../utils/helpers';

const initialState = {
  globalTotalMarketCap: undefined,
  globalChange: undefined,
  globalPercentChange: undefined,
  globalVolume24h: undefined,
  globalBtcDom: undefined,
  globalNumCoins: undefined,
  globalSummaryLoaded: false,
  profileAvgPrice: undefined,
  profileChange24h: undefined,
  profilePercentChange: undefined,
  profileVolume24h: undefined,
  profileSummaryLoaded: false
};

let globalSummaryCache = {};
let profileSummaryCache = {};

/* *********************************************** Actions *********************************************** */

const FETCH_GLOBAL_SUMMARY = 'coins/FETCH_GLOBAL_SUMMARY';
const FETCH_PROFILE_SUMMARY = 'coins/FETCH_PROFILE_SUMMARY';
const SET_GLOBAL_SUMMARY = 'coins/SET_GLOBAL_SUMMARY';
const SET_PROFILE_SUMMARY = 'coins/SET_PROFILE_SUMMARY';
const SET_PROFILE_SUMMARY_LOADED = 'coins/SET_PROFILE_SUMMARY_LOADED';
const REFRESH_GLOBAL_SUMMARY = 'coins/REFRESH_GLOBAL_SUMMARY';
const REFRESH_PROFILE_SUMMARY = 'coins/REFRESH_PROFILE_SUMMARY';
const RESET_GLOBAL_SUMMARY = 'coins/RESET_GLOBAL_SUMMARY';
const RESET_PROFILE_SUMMARY = 'coins/REFRESH_PROFILE_SUMMARY';

/* ******************************************* Actions Creators ****************************************** */

function fetchGlobalSummary() {
  return {
    type: FETCH_GLOBAL_SUMMARY
  };
}

function fetchProfileSummary(symbol) {
  return {
    type: FETCH_PROFILE_SUMMARY,
    symbol
  };
}

function setGlobalSummary(globalTotalMarketCap, globalChange, globalPercentChange, globalVolume24h, globalBtcDom, globalNumCoins) {
  return {
    type: SET_GLOBAL_SUMMARY,
    globalTotalMarketCap,
    globalChange,
    globalPercentChange,
    globalVolume24h,
    globalBtcDom,
    globalNumCoins
  };
}

function setProfileSummary(profileAvgPrice, profileChange24h, profilePercentChange, profileVolume24h) {
  return {
    type: SET_PROFILE_SUMMARY,
    profileAvgPrice,
    profileChange24h,
    profilePercentChange,
    profileVolume24h
  };
}

function setProfileSummaryLoaded() {
  return {
    type: SET_PROFILE_SUMMARY_LOADED
  };
}

function refreshGlobalSummary() {
  return {
    type: REFRESH_GLOBAL_SUMMARY
  };
}

function refreshProfileSummary() {
  return {
    type: REFRESH_PROFILE_SUMMARY
  };
}

function resetGlobalSummary() {
  return {
    type: RESET_GLOBAL_SUMMARY
  };
}

function resetProfileSummary() {
  return {
    type: RESET_PROFILE_SUMMARY
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_GLOBAL_SUMMARY:
      return {
        ...state,
        globalTotalMarketCap: action.globalTotalMarketCap,
        globalChange: action.globalChange,
        globalPercentChange: action.globalPercentChange,
        globalVolume24h: action.globalVolume24h,
        globalBtcDom: action.globalBtcDom,
        globalNumCoins: action.globalNumCoins,
        globalSummaryLoaded: true
      };
    case SET_PROFILE_SUMMARY:
      return {
        ...state,
        profileAvgPrice: action.profileAvgPrice,
        profileChange24h: action.profileChange24h,
        profilePercentChange: action.profilePercentChange,
        profileVolume24h: action.profileVolume24h
      };
    case SET_PROFILE_SUMMARY_LOADED:
      return {
        ...state,
        profileSummaryLoaded: true
      };
    case RESET_GLOBAL_SUMMARY:
      return {
        ...state,
        globalSummary: initialState.globalSummary,
        globalSummaryLoaded: initialState.globalSummaryLoaded
      };
    case RESET_PROFILE_SUMMARY:
      return {
        ...state,
        profileSummary: initialState.profileSummary,
        profileSummaryLoaded: initialState.profileSummaryLoaded
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function normalizeGlobalSummary(globalSummary) {
  return {
    totalMarketCap: parseFloat(globalSummary.total_market_cap),
    change: parseFloat(globalSummary.change),
    percentChange: parseFloat(globalSummary.percent_change),
    volume24h: parseFloat(globalSummary.twenty_four_hr_volume),
    btcDom: parseFloat(globalSummary.btc_dom_index),
    numCoins: parseFloat(globalSummary.num_coins)
  };
}

function normalizeProfileSummary(profileSummary) {
  const avgPrice = parseFloat(profileSummary.price);
  const change24h = parseFloat(profileSummary.price) - parseFloat(profileSummary.price_24hr);
  const percentChange = change24h / parseFloat(profileSummary.price_24hr);
  const volume24h = parseFloat(profileSummary.volume_usd_24hr);

  return {
    symbol: profileSummary.symbol,
    avgPrice,
    change24h,
    percentChange,
    volume24h
  };
}

function* fetchGlobalSummaryWorker() {
  const res = yield call(getCoinsSummary);
  if (res.error) {
    Logger.error('Error fetching summary: ', res.error);
    return;
  }

  globalSummaryCache = normalizeGlobalSummary(res);
  yield put(refreshGlobalSummary());
}

function* refreshGlobalSummaryWorker() {
  const state = yield select();
  const {
    forex: { forexLoaded, forex },
    prices: { pricesLoaded, prices },
    user: { user: { preferences: { pref_currency: prefCurrency } } }
  } = state.global;

  if (!forexLoaded || !pricesLoaded || Object.keys(globalSummaryCache).length === 0) {
    return;
  }

  const globalTotalMarketCap = globalSummaryCache.totalMarketCap * getPriceInPrefCurrency('USD', prefCurrency, prices, forex);
  const globalChange = globalSummaryCache.change * getPriceInPrefCurrency('USD', prefCurrency, prices, forex);
  const globalPercentChange = globalSummaryCache.percentChange;
  const globalVolume24h = globalSummaryCache.volume24h;
  const globalBtcDom = globalSummaryCache.btcDom;
  const globalNumCoins = globalSummaryCache.numCoins;

  yield put(setGlobalSummary(globalTotalMarketCap, globalChange, globalPercentChange, globalVolume24h, globalBtcDom, globalNumCoins));
}

function* fetchProfileSummaryWorker(action) {
  const { symbol } = action;
  const res = yield call(getCoinInfo, symbol);

  if (res.error) {
    Logger.error('Error fetching summary: ', res.error);
    return;
  }
  if (res.length === 0) {
    return;
  }
  const [profileSummary] = res;

  profileSummaryCache = normalizeProfileSummary(profileSummary);
  yield put(refreshProfileSummary());
  yield put(setProfileSummaryLoaded());
}

function* refreshProfileSummaryWorker() {
  const state = yield select();
  const {
    forex: { forexLoaded, forex },
    prices: { pricesLoaded, prices },
    user: { user: { preferences: { pref_currency: prefCurrency } } },
  } = state.global;

  if (!forexLoaded || !pricesLoaded || Object.keys(profileSummaryCache).length === 0) {
    return;
  }

  const originalPrice = convertGivenUSDRate(prefCurrency, profileSummaryCache.avgPrice, prices, forex);
  const originalPrice24h = convertGivenUSDRate(prefCurrency, profileSummaryCache.price24h, prices, forex);

  const quadPrice = getPriceInPrefCurrency(profileSummaryCache.symbol, prefCurrency, prices, forex);
  const quadPrice24h = getPriceInPrefCurrency(profileSummaryCache.symbol, prefCurrency, prices, forex, true);

  const profileAvgPrice = quadPrice || originalPrice;
  const price24h = quadPrice24h || originalPrice24h;
  const profileChange24h = profileAvgPrice - price24h;
  const profilePercentChange = calcPercentChange(profileAvgPrice, price24h);
  const profileVolume24h = profileSummaryCache.volume24h * getPriceInPrefCurrency('USD', prefCurrency, prices, forex);

  yield put(setProfileSummary(profileAvgPrice, profileChange24h, profilePercentChange, profileVolume24h));
}

function* fetchGlobalSummaryWatcher() {
  yield takeLatest(FETCH_GLOBAL_SUMMARY, fetchGlobalSummaryWorker);
}

function* refreshGlobalSummaryWatcher() {
  yield takeLatest(REFRESH_GLOBAL_SUMMARY, refreshGlobalSummaryWorker);
}

function* fetchProfileSummaryWatcher() {
  yield takeLatest(FETCH_PROFILE_SUMMARY, fetchProfileSummaryWorker);
}

function* refreshProfileSummaryWatcher() {
  yield takeLatest(REFRESH_PROFILE_SUMMARY, refreshProfileSummaryWorker);
}

export { fetchGlobalSummary, refreshGlobalSummary, resetGlobalSummary, fetchProfileSummary, refreshProfileSummary, resetProfileSummary };

export const sagas = [
  fetchGlobalSummaryWatcher,
  refreshGlobalSummaryWatcher,
  fetchProfileSummaryWatcher,
  refreshProfileSummaryWatcher
];

export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/coins/summary.js