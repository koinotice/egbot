import { select, put, takeLatest, takeEvery, call, take } from 'redux-saga/effects';
import { delay, eventChannel } from 'redux-saga';
import throttle from 'lodash/throttle';
import { getPrices } from '../../../api/public/prices';
import { subscribePublicStream, unsubscribePublicStream } from '../../../api/public/publicStreams';
import logger from '../../../utils/logger';
import { getPriceInPrefCurrency } from '../../../utils/helpers';

let streamConnected = false;
let eventHandler = null;
const INITIAL_RECONNECT_TIMEOUT = 1000; // first reconnect attempt in 1 sec, exponentially increasing thereafter
let reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

const SUBSCRIPTION_TYPE = 'priceStream';

const initialState = {
  markets: {},
  marketsLoaded: false
};

let marketsCache = null;

/* *********************************************** Actions *********************************************** */

const FETCH_MARKETS_FOR_COIN = 'coins/FETCH_MARKETS_FOR_COIN';
const SET_MARKETS_FOR_COIN = 'coins/SET_MARKETS_FOR_COIN';
const SUBSCRIBE_TICKER_FOR_COIN_MARKETS = 'coins/SUBSCRIBE_TICKER_FOR_COIN_MARKETS';
const UNSUBSCRIBE_TICKER_FOR_COIN_MARKETS = 'coins/UNSUBSCRIBE_TICKER_FOR_COIN_MARKETS';
const CLEAR_MARKETS_FOR_COIN = 'coins/CLEAR_MARKETS_FOR_COIN';
const REFRESH_MARKETS_FOR_COIN = 'coins/REFRESH_MARKETS_FOR_COIN';

/* ******************************************* Actions Creators ****************************************** */

function fetchMarketsForCoin(symbol) {
  return {
    type: FETCH_MARKETS_FOR_COIN,
    symbol
  };
}

function setMarketsForCoin(markets) {
  return {
    type: SET_MARKETS_FOR_COIN,
    markets
  };
}

function subscribeTickerForCoinMarkets(symbol, markets) {
  return {
    type: SUBSCRIBE_TICKER_FOR_COIN_MARKETS,
    symbol,
    markets
  };
}

function unsubscribeTickerForCoinMarkets() {
  return {
    type: UNSUBSCRIBE_TICKER_FOR_COIN_MARKETS
  };
}

function clearMarketsForCoin() {
  return {
    type: CLEAR_MARKETS_FOR_COIN
  };
}

function refreshMarketsForCoin() {
  return {
    type: REFRESH_MARKETS_FOR_COIN
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_MARKETS_FOR_COIN:
      return {
        ...state,
        markets: action.markets,
        marketsLoaded: true
      };
    case CLEAR_MARKETS_FOR_COIN:
      return initialState;
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

const throttledSetMarketsForCoin = throttle(setMarketsForCoin, 1000);

function filterForSymbol(symbol, prices) {
  return Object.keys(prices)
    .filter(pair => pair.startsWith(`${symbol}/`))
    .reduce((acc, cur) => {
      acc[cur] = prices[cur];
      return acc;
    }, {});
}

function normalizePairPrices(pairPrices, exchanges, globalPrices, forex, prefCurrency) {
  return Object.keys(pairPrices).reduce((acc, pair) => {
    Object.keys(pairPrices[pair]).forEach((exchange) => {
      if (!exchanges[exchange]) {
        return;
      }

      const key = `${exchange}_${pair}`;
      const change24h = pairPrices[pair][exchange].price - pairPrices[pair][exchange].price24h;
      const percentChange = change24h / pairPrices[pair][exchange].price24h;

      const [, quote] = pair.split('/');
      const volume24hPrefCurrency = pairPrices[pair][exchange].volume24h * getPriceInPrefCurrency(quote, prefCurrency, globalPrices, forex);
      const pricePrefCurrency = pairPrices[pair][exchange].price * getPriceInPrefCurrency(quote, prefCurrency, globalPrices, forex);

      acc[key] = Object.assign(pairPrices[pair][exchange], {
        pair,
        exchange,
        exchangeLabel: exchanges[exchange].exchange_label,
        change24h,
        percentChange,
        volume24hPrefCurrency,
        pricePrefCurrency
      });
    });
    return acc;
  }, {});
}

function normalizeTickerStream(exchange, exchanges, prices, globalPrices, forex, prefCurrency) {
  const pair = Object.keys(prices)[0];
  const ticker = Object.values(prices)[0];
  const [, quote] = pair.split('/');

  const volume24hPrefCurrency = ticker.volume * getPriceInPrefCurrency(quote, prefCurrency, globalPrices, forex);
  const pricePrefCurrency = ticker.price * getPriceInPrefCurrency(quote, prefCurrency, globalPrices, forex);

  return {
    exchange,
    exchangeLabel: exchanges[exchange].exchange_label,
    pair,
    price: ticker.price,
    percentChange: parseFloat(ticker.percentChange) / 100,
    volume24h: ticker.volume,
    volume24hPrefCurrency,
    pricePrefCurrency
  };
}

function* fetchMarketsForCoinWorker(action) {
  const { symbol } = action;
  const state = yield select();
  const {
    exchanges: { exchanges },
    forex: { forexLoaded, forex },
    prices: { pricesLoaded: globalPricesLoaded, prices: globalPrices },
    user: { user: { preferences: { pref_currency: prefCurrency } } }
  } = state.global;

  if (!forexLoaded || !globalPricesLoaded) {
    return;
  }

  const prices = yield call(getPrices);
  if (prices.error) {
    logger.error('error attempting initial ticker fetch', prices.error);
    yield call(delay, reconnectTimeout);
    reconnectTimeout *= 2;
    yield put(fetchMarketsForCoin(symbol));
  } else {
    const pairPricesForSymbol = filterForSymbol(symbol, prices);
    const markets = normalizePairPrices(pairPricesForSymbol, exchanges, globalPrices, forex, prefCurrency);

    marketsCache = markets;

    yield put(setMarketsForCoin(markets));
    yield put(subscribeTickerForCoinMarkets(symbol, markets));
  }
}

function* fetchMarketsForCoinWatcher() {
  yield takeLatest(FETCH_MARKETS_FOR_COIN, fetchMarketsForCoinWorker);
}

function initStream(subscriptionPayload) {
  return eventChannel((emit) => {
    eventHandler = emit;
    subscribePublicStream(subscriptionPayload, eventHandler);
    return () => {};
  });
}

function* subscribeTickerForCoinMarketsWorker(action) {
  const state = yield select();
  const {
    exchanges: { exchanges }
  } = state.global;
  const { symbol, markets } = action;

  const exchangeSet = new Set();
  const pairSet = new Set();

  Object.keys(markets).forEach((exchangePair) => {
    const [exchange, pair] = exchangePair.split('_');
    exchangeSet.add(exchange);
    pairSet.add(pair);
  });

  const subscriptionPayload = {
    subscriptionType: 'priceStream', exchanges: Array.from(exchangeSet), pairs: Array.from(pairSet), eventType: 'subscribe'
  };

  if (!streamConnected) {
    const streamEventChannel = yield call(initStream, subscriptionPayload);
    streamConnected = true;

    while (true) {
      const {
        global: {
          forex: { forex },
          prices: { prices: globalPrices },
          user: { user: { preferences: { pref_currency: prefCurrency } } }
        }
      } = yield select();

      const data = yield take(streamEventChannel);
      if (data.subscriptionType === 'RECONNECT') {
        logger.info('disconnected from price stream, re-initializing');
        streamEventChannel.close();
        eventHandler = null;
        streamConnected = false;
        yield put(fetchMarketsForCoin(symbol));
        break;
      }

      if (data.subscriptionType === SUBSCRIPTION_TYPE) {
        const { exchange, prices } = data;
        if (exchanges[exchange]) {
          const normalizedTicker = normalizeTickerStream(exchange, exchanges, prices, globalPrices, forex, prefCurrency);
          const key = `${exchange}_${normalizedTicker.pair}`;
          marketsCache[key] = normalizedTicker;
          yield put(throttledSetMarketsForCoin(marketsCache));
        }
      }
    }
  } else {
    yield call(subscribePublicStream, subscriptionPayload, eventHandler);
  }
}

function* subscribeTickerForCoinMarketsWatcher() {
  yield takeEvery(SUBSCRIBE_TICKER_FOR_COIN_MARKETS, subscribeTickerForCoinMarketsWorker);
}

function unsubscribeTickerForCoinMarketsWorker() {
  logger.debug(`unsubscribing [${SUBSCRIPTION_TYPE}]`);
  unsubscribePublicStream(SUBSCRIPTION_TYPE);
}

function* unsubscribeTickerForCoinMarketsWatcher() {
  yield takeEvery(UNSUBSCRIBE_TICKER_FOR_COIN_MARKETS, unsubscribeTickerForCoinMarketsWorker);
}

function* clearMarketsForCoinWorker() {
  yield put(unsubscribeTickerForCoinMarkets());
}

function* clearMarketsForCoinWatcher() {
  yield takeEvery(CLEAR_MARKETS_FOR_COIN, clearMarketsForCoinWorker);
}

function* refreshMarketsForCoinWorker() {
  const state = yield select();
  const { markets: { marketsLoaded } } = state.coins;
  if (!marketsLoaded) {
    return;
  }

  const {
    user: { user: { preferences: { pref_currency: prefCurrency } } },
    forex: { forexLoaded, forex },
    prices: { pricesLoaded, prices }
  } = state.global;

  if (!forexLoaded || !pricesLoaded || !Object.keys(marketsCache).length) {
    return;
  }

  const refreshedMarkets = JSON.parse(JSON.stringify(marketsCache));
  Object.keys(refreshedMarkets).forEach((market) => {
    const { volume24h, price } = refreshedMarkets[market];
    const [, quote] = refreshedMarkets[market].pair.split('/');
    refreshedMarkets[market].volume24hPrefCurrency = volume24h * getPriceInPrefCurrency(quote, prefCurrency, prices, forex);
    refreshedMarkets[market].pricePrefCurrency = price * getPriceInPrefCurrency(quote, prefCurrency, prices, forex);
  });

  marketsCache = refreshedMarkets;
  yield put(setMarketsForCoin(refreshedMarkets));
}

function* refreshMarketsForCoinWatcher() {
  yield takeLatest(REFRESH_MARKETS_FOR_COIN, refreshMarketsForCoinWorker);
}

export { fetchMarketsForCoin, clearMarketsForCoin, refreshMarketsForCoin };
export const sagas = [
  fetchMarketsForCoinWatcher,
  subscribeTickerForCoinMarketsWatcher,
  unsubscribeTickerForCoinMarketsWatcher,
  clearMarketsForCoinWatcher,
  refreshMarketsForCoinWatcher
];

export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/coins/markets.js