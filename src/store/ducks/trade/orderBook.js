import { takeEvery, put, select, call, take } from 'redux-saga/effects';
import { delay, eventChannel } from 'redux-saga';
import throttle from 'lodash/throttle';
import { subscribePublicStream, unsubscribePublicStream } from '../../../api/public/publicStreams';
import logger from '../../../utils/logger';

let streamConnected = false;

const SUBSCRIPTION_TYPE = 'orderStream';
const MAX_ORDER_BOOK_SIZE = 50;


const initialState = {
  orderBookStreamData: null,
  isLoaded: false,
};

let currentOrderBook;

const INITIAL_RECONNECT_TIMEOUT = 1000; // first reconnect attempt in 1 sec, exponentially increasing thereafter
let reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

/* *********************************************** Actions *********************************************** */


const ORDER_BOOK_INIT = 'trade/ORDER_BOOK_INIT';
const ORDER_BOOK_UNSUBSCRIBE_STREAM = 'trade/ORDER_BOOK_UNSUBSCRIBE_STREAM';
const ORDER_BOOK_STREAM_MESSAGE_RECEIVED = 'trade/ORDER_BOOK_STREAM_MESSAGE_RECEIVED';

/* ******************************************* Actions Creators ****************************************** */

function subscribeOrderBook() {
  return {
    type: ORDER_BOOK_INIT,
  };
}

function unsubscribeOrderBook() {
  return {
    type: ORDER_BOOK_UNSUBSCRIBE_STREAM,
  };
}

function orderBookStreamMessageReceived(data, loaded) {
  return {
    type: ORDER_BOOK_STREAM_MESSAGE_RECEIVED,
    data,
    loaded,
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ORDER_BOOK_STREAM_MESSAGE_RECEIVED:
      return {
        ...state,
        orderBookStreamData: action.data,
        isLoaded: action.loaded
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function unsubscribeOrderBookStreamWorker() {
  logger.debug(`unsubscribing [${SUBSCRIPTION_TYPE}]`);
  unsubscribePublicStream(SUBSCRIPTION_TYPE);
}

function* unsubscribeOrderBookStreamWatcher() {
  yield takeEvery(ORDER_BOOK_UNSUBSCRIBE_STREAM, unsubscribeOrderBookStreamWorker);
}

function initStream(subscriptionPayload) {
  return eventChannel((emit) => {
    subscribePublicStream(subscriptionPayload, emit);
    return () => {};
  });
}

function handleAsksBids(asksbids, quoteType) {
  Object.keys(asksbids).forEach((price) => {
    const { deltaType } = asksbids[price];
    if (deltaType === 'E' || deltaType === 'N') {
      if (!Object.prototype.isPrototypeOf.call(currentOrderBook[quoteType], price)) {
        currentOrderBook[quoteType][price] = {
          volume: null,
          total: null,
        };
      }

      currentOrderBook[quoteType][price].volume = asksbids[price].volume;
      currentOrderBook[quoteType][price].total = asksbids[price].total;
      return;
    }

    // if deltaType === 'D'
    delete currentOrderBook[quoteType][price];
  });
}

function updateCurrentOrderBook(deltas) {
  handleAsksBids(deltas.bids, 'bids');
  handleAsksBids(deltas.asks, 'asks');
}

function sortOrderBook() {
  if (!currentOrderBook) return;
  const sortedOrderBook = JSON.parse(JSON.stringify(currentOrderBook));

  const bids = [];
  Object.keys(sortedOrderBook.bids).sort((a, b) => (parseFloat(b) - parseFloat(a))).splice(0, MAX_ORDER_BOOK_SIZE).forEach((price) => {
    bids.push({
      price,
      volume: currentOrderBook.bids[price].volume,
      total: currentOrderBook.bids[price].total,
    });
  });
  sortedOrderBook.bids = bids;

  const asks = [];
  Object.keys(sortedOrderBook.asks).sort((a, b) => (parseFloat(a) - parseFloat(b))).splice(0, MAX_ORDER_BOOK_SIZE).forEach((price) => {
    asks.unshift({
      price,
      volume: currentOrderBook.asks[price].volume,
      total: currentOrderBook.asks[price].total,
    });
  });
  sortedOrderBook.asks = asks;

  return sortedOrderBook;
}

function* throttledOrderBookStreamMessageReceived() {
  yield put(orderBookStreamMessageReceived(sortOrderBook(), true));
}

function* subscribeOrderBookStreamWorker() {
  const state = yield select();
  const { currentExchange: exchange } = state.trade.interactions;
  const { currentPair: pair } = state.trade.interactions;
  const throttledSortAndUpdate = throttle(throttledOrderBookStreamMessageReceived, 500);
  logger.debug(`subscribing [${SUBSCRIPTION_TYPE}] for exchange=[${exchange}] pair=[${pair}]`);
  const subscriptionPayload = {
    subscriptionType: SUBSCRIPTION_TYPE, exchange, pair, eventType: 'subscribe'
  };

  if (currentOrderBook) {
    currentOrderBook = null;
    yield put(orderBookStreamMessageReceived(null, false));
  }

  if (!streamConnected) {
    const streamEventChannel = yield call(initStream, subscriptionPayload);
    streamConnected = true;

    while (true) {
      const data = yield take(streamEventChannel);

      if (data.subscriptionType === 'RECONNECT') {
        logger.info('disconnected from order book stream, re-initializing');
        streamEventChannel.close();
        streamConnected = false;
        yield call(delay, reconnectTimeout);
        reconnectTimeout *= 2;
        yield put(subscribeOrderBook());
        break;
      }

      reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

      if (data.subscriptionType === `${SUBSCRIPTION_TYPE}-snapshot`) {
        const { pair: messagePair, bids, asks } = data;
        const { currentPair: currentPairWhenReceivedMessage } = (yield select()).trade.interactions;
        if (messagePair === currentPairWhenReceivedMessage) {
          reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;
          if (bids && asks) {
            currentOrderBook = {};
            currentOrderBook.bids = bids;
            currentOrderBook.asks = asks;
            yield put(orderBookStreamMessageReceived(sortOrderBook(), true));
          }
        }
      }

      if (data.subscriptionType === `${SUBSCRIPTION_TYPE}-delta`) {
        const { pair: messagePair } = data;
        const { currentPair: currentPairWhenReceivedMessage } = (yield select()).trade.interactions;
        if (messagePair === currentPairWhenReceivedMessage && currentOrderBook) {
          updateCurrentOrderBook(data);
          yield throttledSortAndUpdate();
        }
      }
    }
  } else {
    yield call(subscribePublicStream, subscriptionPayload);
  }
}

function* fetchInitialOrderBookStreamWatcher() {
  yield takeEvery(ORDER_BOOK_INIT, subscribeOrderBookStreamWorker);
}


/* ******************************************************************************************************* */

export { // action creators
  subscribeOrderBook,
  unsubscribeOrderBook,
};
export const sagas = [
  fetchInitialOrderBookStreamWatcher,
  unsubscribeOrderBookStreamWatcher,
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/trade/orderBook.js