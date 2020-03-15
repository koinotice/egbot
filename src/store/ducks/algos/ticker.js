import { put, takeEvery, call, take } from 'redux-saga/effects';
import { delay, eventChannel } from 'redux-saga';
import throttle from 'lodash/throttle';
import getTicker from '../../../api/tickerData';
import { subscribePublicStream, unsubscribePublicStream } from '../../../api/public/publicStreams';
import logger from '../../../utils/logger';

let streamConnected = false;
let eventHandler = null;
const INITIAL_RECONNECT_TIMEOUT = 1000;
let reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

const SUBSCRIPTION_TYPE = 'priceStream';

const initialState = {
  ticker: {}
};

let currentTicker;

/* *********************************************** Actions *********************************************** */

const INIT_TICKER = 'algos/INIT_TICKER';
const SUBSCRIBE_TICKER = 'algos/SUBSCRIBE_TICKER';
const UNSUBSCRIBE_TICKER = 'algos/UNSUBSCRIBE_TICKER';
const TICKER_RECEIVED = 'algos/TICKER_RECEIVED';
const RESET_TICKER = 'algos/RESET_TICKER';

/* ******************************************* Actions Creators ****************************************** */

function initTicker(exchange, pair) {
  return {
    type: INIT_TICKER,
    exchange,
    pair,
  };
}

function setTickerData(data) {
  return {
    type: TICKER_RECEIVED,
    data
  };
}


function subscribeTicker(exchange, pair) {
  return {
    type: SUBSCRIBE_TICKER,
    exchange,
    pair
  };
}

function unsubscribeTicker() {
  return {
    type: UNSUBSCRIBE_TICKER
  };
}

function resetTicker() {
  return {
    type: RESET_TICKER
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case TICKER_RECEIVED:
      return {
        ...state,
        ticker: action.data
      };
    case RESET_TICKER:
      return initialState;
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function setInitialTicker(rawTicker, exchange, pair) {
  currentTicker = rawTicker.bySymbol[pair][exchange.toUpperCase()];
}

function* initiateTickerWorker(action) {
  const { exchange, pair } = action;

  try {
    const tickerData = yield getTicker({ dataParam: exchange });
    if (tickerData.error) {
      logger.error(`attempting initial ticker fetch in ${reconnectTimeout}ms`);
      yield call(delay, reconnectTimeout);
      reconnectTimeout *= 2;
      yield put(initTicker());

      return;
    }
    reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

    setInitialTicker(tickerData, exchange, pair);
    yield put(setTickerData(currentTicker));
    yield put(subscribeTicker(exchange, pair));
  } catch (err) {
    logger.error('error attempting initial ticker fetch', err);
    yield call(delay, reconnectTimeout);
    reconnectTimeout *= 2;
    yield put(initTicker());
  }
}

function* initiateTickerWatcher() {
  yield takeEvery(INIT_TICKER, initiateTickerWorker);
}

function initStream(subscriptionPayload) {
  return eventChannel((emit) => {
    eventHandler = emit;
    subscribePublicStream(subscriptionPayload, eventHandler);
    return () => {};
  });
}

function normalizeTickerStream(newTicker, pair) {
  const newTickerPrices = newTicker.prices[pair];

  currentTicker.price = newTickerPrices.price;
  currentTicker.high = parseFloat(newTickerPrices.high);
  currentTicker.low = parseFloat(newTickerPrices.low);
  currentTicker.volume24h = parseFloat(newTickerPrices.volume);
  currentTicker.ts = newTickerPrices.priceTs;
  return JSON.parse(JSON.stringify(currentTicker));
}

function* subscribeTickerWorker(action) {
  const { exchange, pair } = action;
  const throttledSetTickerData = throttle(setTickerData, 1000);

  logger.debug(`subscribing [${SUBSCRIPTION_TYPE}] for exchange=[${exchange}]`);
  const subscriptionPayload = {
    subscriptionType: SUBSCRIPTION_TYPE, exchanges: [exchange], pairs: [pair], eventType: 'subscribe'
  };

  if (!streamConnected) {
    const streamEventChannel = yield call(initStream, subscriptionPayload);
    streamConnected = true;
    while (true) {
      const data = yield take(streamEventChannel);

      if (data.subscriptionType === 'RECONNECT') {
        logger.info('disconnected from ticker stream, re-initializing');
        streamEventChannel.close();
        eventHandler = null;
        streamConnected = false;
        yield put(initTicker(exchange, pair));
        break;
      }

      if (data.subscriptionType === SUBSCRIPTION_TYPE) {
        if (currentTicker && data.prices[pair]) {
          const newTicker = normalizeTickerStream(data, pair);
          yield put(throttledSetTickerData(newTicker));
        }
      }
    }
  } else {
    yield call(subscribePublicStream, subscriptionPayload, eventHandler);
  }
}

function* unsubscribeTickerWorker() {
  logger.debug(`unsubscribing ${SUBSCRIPTION_TYPE}`);
  unsubscribePublicStream(SUBSCRIPTION_TYPE);
  yield put(resetTicker());
  streamConnected = false;
  currentTicker = null;
}

function* unsubscribeTickerWatcher() {
  yield takeEvery(UNSUBSCRIBE_TICKER, unsubscribeTickerWorker);
}

function* subscribeTickerWatcher() {
  yield takeEvery(SUBSCRIBE_TICKER, subscribeTickerWorker);
}

export { initTicker, unsubscribeTicker };

export const sagas = [
  initiateTickerWatcher,
  subscribeTickerWatcher,
  unsubscribeTickerWatcher
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/algos/ticker.js