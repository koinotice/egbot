import { put, select, takeEvery, call, take } from 'redux-saga/effects';
import { delay, eventChannel } from 'redux-saga';
import throttle from 'lodash/throttle';
import getTicker from '../../../api/tickerData';
import { subscribePublicStream, unsubscribePublicStream } from '../../../api/public/publicStreams';
import logger from '../../../utils/logger';
import { updatePair } from './interactions';


let streamConnected = false;
let eventHandler = null;
const INITIAL_RECONNECT_TIMEOUT = 1000; // first reconnect attempt in 1 sec, exponentially increasing thereafter
let reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

const SUBSCRIPTION_TYPE = 'priceStream';
const DEFAULT_COIN = 'BTC';
const DEFAULT_MARKET = 'USD';

const initialState = {
  ticker: {},
};

let currentTicker;

/* *********************************************** Actions *********************************************** */

const INIT_TICKER = 'trade/INIT_TICKER';
const SUBSCRIBE_TICKER = 'trade/SUBSCRIBE_TICKER';
const UNSUBSCRIBE_TICKER = 'trade/UNSUBSCRIBE_TICKER';
const TICKER_RECEIVED = 'trade/TICKER_RECEIVED';

/* ******************************************* Actions Creators ****************************************** */

function initTicker() {
  return {
    type: INIT_TICKER,
  };
}

function setTickerData(data) {
  return {
    type: TICKER_RECEIVED,
    data
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
    case TICKER_RECEIVED:
      return {
        ...state,
        ticker: action.data
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */


function setInitialTicker(rawTicker) {
  currentTicker = rawTicker;
  Object.keys(rawTicker.byMarket).forEach((market) => {
    Object.keys(rawTicker.byMarket[market]).forEach((pair) => {
      const pairPrice = currentTicker.byMarket[market][pair].price;
      const pairPrice24h = currentTicker.byMarket[market][pair].price24h;
      const priceDifference = (parseFloat(pairPrice) - parseFloat(pairPrice24h));
      const percentChange = parseFloat(pairPrice24h) !== 0 ? (priceDifference / parseFloat(pairPrice24h)) * 100 : 0;
      currentTicker.byMarket[market][pair].percentChange = percentChange;
    });
  });
}

function removeInactivePairs(exchangeMarketsData, tickerData) {
  if (!Object.keys(exchangeMarketsData).length) {
    return tickerData;
  }
  const finalTicker = {
    bySymbol: {},
    byMarket: {},
  };
  Object.keys(exchangeMarketsData).forEach((exchangePair) => {
    // if (exchangeMarketsData[exchangePair].active) {
    if (tickerData.bySymbol[exchangePair]) {
      const market = exchangePair.split('/')[1];
      finalTicker.bySymbol[exchangePair] = tickerData.bySymbol[exchangePair];
      if (!finalTicker.byMarket[market]) {
        finalTicker.byMarket[market] = {};
      }
      finalTicker.byMarket[market][exchangePair] = tickerData.byMarket[market][exchangePair];
    }
    // }
  });

  return finalTicker;
}


function* initiateTickerWork() {
  const state = yield select();
  const { currentExchange, currentPair } = state.trade.interactions;

  try {
    const tickerData = yield getTicker({ dataParam: currentExchange });
    if (tickerData.error) {
      logger.info(`attempting initial ticker fetch in ${reconnectTimeout}ms`);
      yield call(delay, reconnectTimeout);
      reconnectTimeout *= 2;
      yield put(initTicker());

      return;
    }
    reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

    const { exchangeMarketsData } = state.trade.markets;
    const finalTickerData = removeInactivePairs(exchangeMarketsData, tickerData);

    if (!currentPair || !finalTickerData.bySymbol[currentPair]) {
      const marketArray = Object.keys(finalTickerData.byMarket).filter(mkt => mkt.includes(DEFAULT_MARKET) === true);

      if (marketArray.length) {
        const market = marketArray.find(mkt => mkt === `${DEFAULT_MARKET}T`) || marketArray.find(mkt => mkt === DEFAULT_MARKET) || marketArray[0];
        const marketObjects = finalTickerData.byMarket[market];
        const nextPair = Object.keys(marketObjects).filter(mkt => mkt.startsWith(DEFAULT_COIN) === true);

        if (nextPair.length) {
          yield put(updatePair(nextPair[0]));
        } else {
          const firstPairForMarket = Object.keys(marketObjects)[0];
          yield put(updatePair(firstPairForMarket));
        }
      } else {
        const market = Object.keys(finalTickerData.byMarket)[0];
        const marketObject = finalTickerData.byMarket[market];
        const nextPair = Object.keys(marketObject)[0];
        yield put(updatePair(nextPair));
      }
    } else {
      yield put(updatePair(currentPair));
    }

    setInitialTicker(finalTickerData);
    yield put(setTickerData(currentTicker));
    yield put(subscribeTicker());
  } catch (err) {
    logger.info('error attempting initial ticker fetch', err);
    yield call(delay, reconnectTimeout);
    reconnectTimeout *= 2;
    yield put(initTicker());
  }
}

function* initiateTickerWatcher() {
  yield takeEvery(INIT_TICKER, initiateTickerWork);
}

function initStream(subscriptionPayload) {
  return eventChannel((emit) => {
    eventHandler = emit;
    subscribePublicStream(subscriptionPayload, eventHandler);
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

function normalizedTickerStream(newTicker) {
  const { prices } = newTicker;

  Object.keys(prices).forEach((pair) => {
    const assets = pair.split('/');
    const market = assets[1];

    currentTicker.byMarket[market][pair].price = prices[pair].price;
    currentTicker.byMarket[market][pair].percentChange = parseFloat(prices[pair].percentChange);
    currentTicker.byMarket[market][pair].high = parseFloat(prices[pair].high);
    currentTicker.byMarket[market][pair].low = parseFloat(prices[pair].low);
    currentTicker.byMarket[market][pair].volume24h = parseFloat(prices[pair].volume);
    currentTicker.byMarket[market][pair].ts = prices[pair].priceTs;
  });
  return JSON.parse(JSON.stringify(currentTicker));
}

function* tickerSubscriptionWorker() {
  const state = yield select();
  const { currentExchange: exchange } = state.trade.interactions;
  const { ticker } = state.trade.ticker;
  const throttledSetTickerData = throttle(setTickerData, 1000);

  const markets = Object.keys(ticker.byMarket);
  let allPairs = [];
  markets.forEach((market) => {
    allPairs = allPairs.concat(Object.keys(ticker.byMarket[market]));
  });

  logger.debug(`subscribing [${SUBSCRIPTION_TYPE}] for exchange=[${exchange}]`);
  const subscriptionPayload = {
    subscriptionType: 'priceStream', exchanges: [exchange], pairs: allPairs, eventType: 'subscribe'
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
        yield put(initTicker());
      }

      if (data.subscriptionType === SUBSCRIPTION_TYPE) {
        const newTicker = normalizedTickerStream(data, exchange);
        yield put(throttledSetTickerData(newTicker));
      }
    }
  } else {
    yield call(subscribePublicStream, subscriptionPayload, eventHandler);
  }
}

function* tickerSubscriptionWatcher() {
  yield takeEvery(SUBSCRIBE_TICKER, tickerSubscriptionWorker);
}

/* ******************************************************************************************************* */


export {
  initTicker,
  unsubscribeTicker,
}; // action creators

export const sagas = [
  initiateTickerWatcher,
  tickerSubscriptionWatcher,
  unsubscribeTickerWatcher
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/trade/ticker.js