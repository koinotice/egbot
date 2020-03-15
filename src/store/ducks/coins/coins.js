import { put, all, takeLatest, select, call } from 'redux-saga/effects';
import { getCoins } from '../../../api/public/coins';
import Logger from '../../../utils/logger';
import { getPriceInPrefCurrency, calcPercentChange, convertGivenUSDRate } from '../../../utils/helpers';
import { fetchNextPage, resetTable } from './table';
import { fetchGlobalSummary, resetGlobalSummary } from './summary';

const initialState = {
  coins: [],
  coinsLoaded: false
};

let localCoinsCache = [];

/* *********************************************** Actions *********************************************** */

const FETCH_COINS = 'coins/FETCH_COINS';
const REFRESH_COINS = 'coins/REFRESH_COINS';
const SET_COINS = 'coins/SET_COINS';
const INIT = 'coins/INIT';
const RESET = 'coins/RESET';

/* ******************************************* Actions Creators ****************************************** */

function fetchCoins(offset, limit, sortBy, order, search) {
  return {
    type: FETCH_COINS,
    offset,
    limit,
    sortBy,
    order,
    search
  };
}

function setCoins(coins) {
  return {
    type: SET_COINS,
    coins,
  };
}

function refreshCoins() {
  return {
    type: REFRESH_COINS
  };
}

function initialize() {
  return {
    type: INIT
  };
}

function reset() {
  return {
    type: RESET
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_COINS:
      return {
        ...state,
        coins: action.coins,
        coinsLoaded: true,
      };
    case RESET:
      return {
        ...state,
        coinsLoaded: false,
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function normalizeCoins(coins) {
  return coins.map(coin => ({
    symbol: coin.symbol,
    name: coin.name,
    price: parseFloat(coin.price),
    price24Hr: parseFloat(coin.price_24hr),
    changePercent24Hr: parseFloat(coin.change_percent_24hr),
    volume24Hr: parseFloat(coin.volume_usd_24hr),
    circulatingSupply: parseFloat(coin.circulating_supply),
    marketCap: parseFloat(coin.market_cap),
    maxSupply: parseFloat(coin.max_supply),
    rank: parseInt(coin.rank, 10),
  }));
}

function* fetchCoinsWorker(action) {
  const {
    offset,
    limit,
    sortBy,
    order,
    search
  } = action;

  const res = yield call(getCoins, offset, limit, sortBy, order, search);
  if (res.error) {
    Logger.error('Error fetching coins: ', res.error);
    return;
  }

  if (res.length === 0) {
    // no results returned set loaded to true and return
    yield put(setCoins([]));
    return;
  }

  localCoinsCache = normalizeCoins(res);
  yield put(refreshCoins());
}

function* refreshCoinsWorker() {
  const state = yield select();
  const {
    forex: { forexLoaded, forex },
    prices: { pricesLoaded, prices },
    user: { user: { preferences: { pref_currency: prefCurrency } } }
  } = state.global;
  if (!forexLoaded || !pricesLoaded || localCoinsCache.length === 0) {
    return;
  }

  const cacheCopy = JSON.parse(JSON.stringify(localCoinsCache));
  const updatedCoins = cacheCopy.map((coin) => {
    const originalPrice = convertGivenUSDRate(prefCurrency, coin.price, prices, forex);
    const originalPrice24h = convertGivenUSDRate(prefCurrency, coin.price24Hr, prices, forex);
    const quadPrice = coin.rank > 500 ? 0 : getPriceInPrefCurrency(coin.symbol, prefCurrency, prices, forex);
    const quadPrice24h = coin.rank > 500 ? 0 : getPriceInPrefCurrency(coin.symbol, prefCurrency, prices, forex, true);

    coin.price = quadPrice || originalPrice;
    coin.price24Hr = quadPrice24h || originalPrice24h;
    coin.change24Hr = coin.price - coin.price24Hr;
    coin.changePercent24Hr = quadPrice ? calcPercentChange(coin.price, coin.price24Hr) : coin.changePercent24Hr / 100;
    coin.volume24h = quadPrice ?
      coin.volume24h * getPriceInPrefCurrency('USD', prefCurrency, prices, forex) :
      coin.volume24h * convertGivenUSDRate(prefCurrency, 1, prices, forex);

    coin.marketCap = coin.price * coin.circulatingSupply;
    return coin;
  });
  yield put(setCoins(updatedCoins));
}

function* initializeWorker() {
  yield all([
    put(fetchGlobalSummary()),
    put(fetchNextPage())
  ]);
}

function* resetWorker() {
  yield all([
    put(setCoins([])),
    put(resetTable()),
    put(resetGlobalSummary())
  ]);
}

function* fetchCoinsWatcher() {
  yield takeLatest(FETCH_COINS, fetchCoinsWorker);
}

function* refreshCoinsWatcher() {
  yield takeLatest(REFRESH_COINS, refreshCoinsWorker);
}

function* initializeWatcher() {
  yield takeLatest(INIT, initializeWorker);
}

function* resetWatcher() {
  yield takeLatest(RESET, resetWorker);
}

export { fetchCoins, refreshCoins, initialize, reset };
export const sagas = [
  fetchCoinsWatcher,
  refreshCoinsWatcher,
  initializeWatcher,
  resetWatcher
];

export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/coins/coins.js