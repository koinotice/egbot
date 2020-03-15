import { takeEvery, put, select, call, take } from 'redux-saga/effects';
import { eventChannel, delay } from 'redux-saga';
import throttle from 'lodash/throttle';
import { subscribePublicStream, unsubscribePublicStream } from '../../../api/public/publicStreams';
import getTradeHistoryFor from '../../../api/public/trades';
import logger from '../../../utils/logger';
import { epochMsToLocalTime } from '../../../utils/time';

let streamConnected = false;

const SUBSCRIPTION_TYPE = 'tradeStream';
const MAX_TRADE_HISTORY = 40;

const initialState = {
  tradeStreamData: [],
  isLoaded: false,
};

let currentTradeHistory = [];

const INITIAL_RECONNECT_TIMEOUT = 1000; // first reconnect attempt in 1 sec, exponentially increasing thereafter
let reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

/* *********************************************** Actions *********************************************** */

const TRADE_HISTORY_INIT = 'trade/TRADE_HISTORY_INIT';
const TRADE_HISTORY_STREAM_SUBSCRIBE_STREAM = 'trade/TRADE_HISTORY_STREAM_SUBSCRIBE_STREAM';
const TRADE_HISTORY_STREAM_UNSUBSCRIBE_STREAM = 'trade/TRADE_HISTORY_STREAM_UNSUBSCRIBE_STREAM';
const TRADE_HISTORY_STREAM_MESSAGE_RECEIVED = 'trade/TRADE_HISTORY_STREAM_MESSAGE_RECEIVED';


/* ******************************************* Actions Creators ****************************************** */

function subscribeTradeHistory() {
  return {
    type: TRADE_HISTORY_INIT,
  };
}

function subscribeTradeHistoryStream() {
  return {
    type: TRADE_HISTORY_STREAM_SUBSCRIBE_STREAM,
  };
}

function unsubscribeTradeHistory() {
  return {
    type: TRADE_HISTORY_STREAM_UNSUBSCRIBE_STREAM,
  };
}

function tradeHistoryStreamMessageReceived(data) {
  return {
    type: TRADE_HISTORY_STREAM_MESSAGE_RECEIVED,
    data,
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case TRADE_HISTORY_INIT:
      return {
        ...state,
        tradeStreamData: [],
        isLoaded: false,
      };
    case TRADE_HISTORY_STREAM_MESSAGE_RECEIVED:
      return {
        ...state,
        tradeStreamData: action.data,
        isLoaded: true,
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function unsubscribeStreamWorker() {
  logger.debug(`unsubscribing [${SUBSCRIPTION_TYPE}]`);
  unsubscribePublicStream(SUBSCRIPTION_TYPE);
}

function* unsubscribeStreamWatcher() {
  yield takeEvery(TRADE_HISTORY_STREAM_UNSUBSCRIBE_STREAM, unsubscribeStreamWorker);
}

function initStream(subscriptionPayload) {
  return eventChannel((emit) => {
    subscribePublicStream(subscriptionPayload, emit);
    return () => {};
  });
}

function updateTradehistory(data) {
  currentTradeHistory.unshift({
    type: data.side,
    size: data.amount,
    price: data.price,
    time: epochMsToLocalTime(data.ts),
    ts: data.ts,
  });

  if (currentTradeHistory.length >= MAX_TRADE_HISTORY) {
    currentTradeHistory = currentTradeHistory.slice(0, MAX_TRADE_HISTORY);
  }
}

function* throttledTradeHistoryStreamMessageReceived() {
  const copyTradeHistory = JSON.parse(JSON.stringify(currentTradeHistory));
  yield put(tradeHistoryStreamMessageReceived(copyTradeHistory));
}

function* subscribeStreamWorker() {
  const state = yield select();
  const { currentExchange: exchange } = state.trade.interactions;
  const { currentPair: pair } = state.trade.interactions;
  const throttledCopyAndUpdate = throttle(throttledTradeHistoryStreamMessageReceived, 1000);

  logger.debug(`subscribing [${SUBSCRIPTION_TYPE}] for exchange=[${exchange}] pair=[${pair}]`);
  const subscriptionPayload = {
    subscriptionType: SUBSCRIPTION_TYPE, exchange, pair, eventType: 'subscribe'
  };
  if (!streamConnected) {
    const streamEventChannel = yield call(initStream, subscriptionPayload);
    streamConnected = true;
    while (true) {
      const data = yield take(streamEventChannel);

      if (data.subscriptionType === 'RECONNECT') {
        logger.info('disconnected from trade history stream, re-initializing');
        streamEventChannel.close();
        streamConnected = false;
        yield put(subscribeTradeHistory());
      }

      if (data.subscriptionType === SUBSCRIPTION_TYPE) {
        updateTradehistory(data);
        yield throttledCopyAndUpdate();
      }
    }
  } else {
    yield call(subscribePublicStream, subscriptionPayload);
  }
}

function* subscribeStreamWatcher() {
  yield takeEvery(TRADE_HISTORY_STREAM_SUBSCRIBE_STREAM, subscribeStreamWorker);
}

function* fetchInitialTradeHistoryStreamWorker() {
  const state = yield select();
  const { currentExchange } = state.trade.interactions;
  const { currentPair } = state.trade.interactions;

  currentTradeHistory.length = 0;

  try {
    const initialTradesHistory = yield call(getTradeHistoryFor, currentExchange, currentPair);
    if (initialTradesHistory.error) {
      logger.info(`initial trade history fetch error, re-attempting initial trade history fetch in ${reconnectTimeout}ms`);
      yield call(delay, reconnectTimeout);
      reconnectTimeout *= 2;
      yield put(subscribeTradeHistory());
      return;
    }
    reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

    initialTradesHistory.trades.reverse().forEach((trade) => { updateTradehistory(trade); });
    const copyTradeHistory = JSON.parse(JSON.stringify(currentTradeHistory));
    yield put(tradeHistoryStreamMessageReceived(copyTradeHistory));
    yield put(subscribeTradeHistoryStream());
  } catch (err) {
    logger.error('error getting initial trade history', err);
    yield call(delay, reconnectTimeout);
    reconnectTimeout *= 2;
    yield put(subscribeTradeHistory());
  }
}

function* fetchInitialTradeHistoryStreamWatcher() {
  yield takeEvery(TRADE_HISTORY_INIT, fetchInitialTradeHistoryStreamWorker);
}

/* ******************************************************************************************************* */

export { subscribeTradeHistory, unsubscribeTradeHistory }; // action creators
export const sagas = [fetchInitialTradeHistoryStreamWatcher, subscribeStreamWatcher, unsubscribeStreamWatcher];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/trade/tradeHistory.js