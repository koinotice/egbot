import { put, take, select, takeEvery, takeLatest, call } from 'redux-saga/effects';
import { delay, eventChannel } from 'redux-saga';
import throttle from 'lodash/throttle';
import { getAveragePrices } from '../../../api/public/prices';
import { subscribePublicStream, unsubscribePublicStream } from '../../../api/public/publicStreams';
import { refreshHoldings } from '../holdings/holdings';
import { refreshCoins } from '../coins/coins';
import { refreshGlobalSummary, refreshProfileSummary } from '../coins/summary';
import { refreshPositions } from '../algos/bots';

import logger from '../../../utils/logger';

let streamConnected = false;

const SUBSCRIPTION_TYPE = 'aggregatePriceStream';

const initialState = {
  prices: {},
  pairs: [],
  pricesLoaded: false
};

let localPricesCache;

const INITIAL_RECONNECT_TIMEOUT = 1000; // first reconnect attempt in 1 sec, exponentially increasing thereafter
let reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

/* *********************************************** Actions *********************************************** */

const FETCH_PRICES = 'global/FETCH_PRICES';
const SET_PRICES = 'global/SET_PRICES';
const SET_PAIRS = 'global/SET_PAIRS';
const SUBSCRIBE_TICKER = 'global/SUBSCRIBE_TICKER';
const UNSUBSCRIBE_TICKER = 'global/UNSUBSCRIBE_TICKER';
const TICKER_RECEIVED = 'global/TICKER_RECEIVED';

/* ******************************************* Actions Creators ****************************************** */

function fetchPrices() {
  return {
    type: FETCH_PRICES,
  };
}

function setPairs(pairs) {
  return {
    type: SET_PAIRS,
    pairs
  };
}

function setPrices(prices) {
  return {
    type: SET_PRICES,
    prices
  };
}

function subscribeTicker() {
  return {
    type: SUBSCRIBE_TICKER
  };
}

function unsubscribeTicker() {
  return {
    type: UNSUBSCRIBE_TICKER
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_PRICES:
      return {
        ...state,
        prices: action.prices,
        pricesLoaded: true
      };
    case SET_PAIRS:
      return {
        ...state,
        pairs: action.pairs,
      };
    case TICKER_RECEIVED:
      return {
        ...state,
        prices: {
          ...state.prices,
          ...action.data
        },
        pricesLoaded: true
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* fetchPricesWorker() {
  const prices = yield call(getAveragePrices);
  if (prices.error) {
    logger.error('Error fetching prices:', prices.error);
    return;
  }

  yield put(setPrices(prices));
  yield put(setPairs(Object.keys(prices)));
  yield put(refreshHoldings());
  yield put(refreshCoins());
  yield put(subscribeTicker());
}

function initStream(subscriptionPayload) {
  return eventChannel((emit) => {
    subscribePublicStream(subscriptionPayload, emit);
    return () => {};
  });
}

function unsubscribeTickerWorker() {
  logger.debug(`unsubscribing [${SUBSCRIPTION_TYPE}]`);
  unsubscribePublicStream(SUBSCRIPTION_TYPE);
}

function* unsubscribeTickerWatcher() {
  yield takeEvery(UNSUBSCRIBE_TICKER, unsubscribeTickerWorker);
}

function updateLocalCache(prices) {
  Object.keys(prices).forEach((symbol) => {
    if (localPricesCache[symbol]) {
      localPricesCache[symbol].price = prices[symbol].price;
      localPricesCache[symbol].high = prices[symbol].high;
      localPricesCache[symbol].low = prices[symbol].low;
      localPricesCache[symbol].volume = prices[symbol].volume;
    }
  });
}

function* updatePrices(allPrices) {
  yield put(setPrices(allPrices));
  yield put(refreshHoldings());
  yield put(refreshCoins());
  yield put(refreshGlobalSummary());
  yield put(refreshProfileSummary());
  yield put(refreshPositions());
}

const throttledUpdatePrices = throttle(updatePrices, 4000);

function* tickerSubscriptionWorker() {
  logger.debug(`subscribing [${SUBSCRIPTION_TYPE}]`);
  const subscriptionPayload = {
    subscriptionType: 'aggregatePriceStream', eventType: 'subscribe'
  };

  if (!streamConnected) {
    const streamEventChannel = yield call(initStream, subscriptionPayload);
    streamConnected = true;
    const state = yield select();
    const { prices } = state.global.prices;

    localPricesCache = JSON.parse(JSON.stringify(prices));
    while (true) {
      const data = yield take(streamEventChannel);
      if (data.subscriptionType === 'RECONNECT') {
        logger.info('disconnected from aggregatePriceStream stream, re-initializing');
        streamEventChannel.close();
        streamConnected = false;
        yield call(delay, reconnectTimeout);
        reconnectTimeout *= 2;
        yield put(subscribeTicker());
        break;
      }

      reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

      if (data.subscriptionType === SUBSCRIPTION_TYPE) {
        const { prices: newPrices } = data;
        updateLocalCache(newPrices);
        yield call(throttledUpdatePrices, localPricesCache);
      }
    }
  } else {
    yield call(subscribePublicStream, subscriptionPayload);
  }
}

function* fetchPricesWatcher() {
  yield takeLatest(FETCH_PRICES, fetchPricesWorker);
}

function* tickerSubscriptionWatcher() {
  yield takeEvery(SUBSCRIBE_TICKER, tickerSubscriptionWorker);
}

/* ******************************************************************************************************* */

export { // action creators
  fetchPrices,
  unsubscribeTicker,
};
export const sagas = [
  fetchPricesWatcher,
  tickerSubscriptionWatcher,
  unsubscribeTickerWatcher
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/global/prices.js