import { takeEvery, put, call, take, } from 'redux-saga/effects';
import { delay, eventChannel } from 'redux-saga';
import { cancelOrderFor, getAllOrders, cancelAllOrdersFor } from '../../../api/private/orders';
import { subscribePrivateStream, unsubscribePrivateStream } from '../../../api/private/privateStreams';
import { fetchProductsAndFeatures } from './paywall';
import logger from '../../../utils/logger';
import { showNotification } from '../global/notifications';
import { isoToUnix } from '../../../utils/time';
import { formatAmount } from '../../../utils/helpers';

const SUBSCRIPTION_TYPE = 'orderStream';

const initialState = {
  openOrdersData: [],
  openOrdersLoaded: false,
  orderHistoryData: [],
  orderHistoryLoaded: false
};

let currentOpenOrders;
let currentOrderHistory;

let streamConnected = false;
const INITIAL_RECONNECT_TIMEOUT = 1000; // first reconnect attempt in 1 sec, exponentially increasing thereafter
let reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

/* *********************************************** Actions *********************************************** */


const OPEN_ORDERS_INIT = 'trade/OPEN_ORDERS_INIT';
const FETCH_ORDER_HISTORY = 'trade/FETCH_ORDER_HISTORY';
const SET_ORDER_HISTORY = 'trade/SET_ORDER_HISTORY';
const OPEN_ORDERS_SUBSCRIBE_STREAM = 'trade/OPEN_ORDERS_SUBSCRIBE_STREAM';
const OPEN_ORDERS_UNSUBSCRIBE_STREAM = 'trade/OPEN_ORDERS_UNSUBSCRIBE_STREAM';
const OPEN_ORDERS_STREAM_MESSAGE_RECEIVED = 'trade/OPEN_ORDERS_STREAM_MESSAGE_RECEIVED';
const OPEN_ORDERS_CANCEL_ORDER = 'trade/OPEN_ORDERS_CANCEL_ORDER';
const OPEN_ORDERS_CANCEL_ALL_ORDER = 'trade/OPEN_ORDERS_CANCEL_ALL_ORDER';

/* ******************************************* Actions Creators ****************************************** */

function subscribeOpenOrders(forceFetch = false) {
  return {
    type: OPEN_ORDERS_INIT,
    forceFetch,
  };
}

function fetchOrderHistory(accountId, pair) {
  return {
    type: FETCH_ORDER_HISTORY,
    accountId,
    pair,
  };
}

function setOrderHistory(data) {
  return {
    type: SET_ORDER_HISTORY,
    data
  };
}

function subscribeOpenOrdersStream() {
  return {
    type: OPEN_ORDERS_SUBSCRIBE_STREAM,
  };
}

function unsubscribeOpenOrders() {
  return {
    type: OPEN_ORDERS_UNSUBSCRIBE_STREAM,
  };
}

function ordersStreamMessageReceived(data) {
  return {
    type: OPEN_ORDERS_STREAM_MESSAGE_RECEIVED,
    data,
  };
}

function cancelOrder(orderId, accountId) {
  return {
    type: OPEN_ORDERS_CANCEL_ORDER,
    orderId,
    accountId,
  };
}

function canceAllOrders(accountIds, pairs) {
  return {
    type: OPEN_ORDERS_CANCEL_ALL_ORDER,
    accountIds,
    pairs,
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case OPEN_ORDERS_STREAM_MESSAGE_RECEIVED:
      return {
        ...state,
        openOrdersData: action.data,
        openOrdersLoaded: true
      };
    case SET_ORDER_HISTORY:
      return {
        ...state,
        orderHistoryData: action.data,
        orderHistoryLoaded: true
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* cancelOrderWorker(data) {
  const { orderId, accountId } = data;

  const orderObject = currentOpenOrders.find(order => order.e_orderId === orderId);
  orderObject.isRequestPending = true;
  yield put(ordersStreamMessageReceived(JSON.parse(JSON.stringify(currentOpenOrders))));
  const cancelOrderResponse = yield call(cancelOrderFor, accountId, orderId);
  orderObject.isRequestPending = false;
  yield put(ordersStreamMessageReceived(JSON.parse(JSON.stringify(currentOpenOrders))));
  if (cancelOrderResponse.error) {
    logger.debug(`cancel order failed because ${cancelOrderResponse.error}`);
    yield put(showNotification({
      error: cancelOrderResponse.error,
    }));

    if (cancelOrderResponse.status === 403) {
      yield put(fetchProductsAndFeatures());
    }
    return;
  }

  logger.debug(`cancel order success for accountId=${accountId} and orderId=${orderId}: ${JSON.stringify(cancelOrderResponse)}`);
  currentOpenOrders = currentOpenOrders.filter(order => order.e_orderId !== orderId);
  yield put(ordersStreamMessageReceived(JSON.parse(JSON.stringify(currentOpenOrders))));
  yield put(showNotification({
    data: 'Successfully canceled order'
  }));
}

function* cancelOrderWatcher() {
  yield takeEvery(OPEN_ORDERS_CANCEL_ORDER, cancelOrderWorker);
}

function* cancelAllOrderWorker(data) {
  const { accountIds, pairs } = data;
  let orderObjects = accountIds
    ? currentOpenOrders.filter(order => order.accountId === accountIds)
    : currentOpenOrders;

  orderObjects = pairs
    ? orderObjects.filter(order => order.pair === pairs)
    : orderObjects;

  orderObjects.forEach((orderObject) => {
    orderObject.isRequestPending = true;
  });
  yield put(ordersStreamMessageReceived(JSON.parse(JSON.stringify(currentOpenOrders))));
  const cancelAllOrderResponses = yield call(cancelAllOrdersFor, accountIds, pairs);
  orderObjects.forEach((orderObject) => {
    orderObject.isRequestPending = false;
  });
  yield put(ordersStreamMessageReceived(JSON.parse(JSON.stringify(currentOpenOrders))));
  if (cancelAllOrderResponses.error) {
    logger.debug(`cancel order failed because ${cancelAllOrderResponses.error}`);
    yield put(showNotification({
      error: cancelAllOrderResponses.error,
    }));

    if (cancelAllOrderResponses.status === 403) {
      yield put(fetchProductsAndFeatures());
    }
    return;
  }

  logger.debug(`cancel order all success for accountId=${accountIds}: ${JSON.stringify(cancelAllOrderResponses)}`);
  const flattenOrderIds = cancelAllOrderResponses.map(orderIdArray => orderIdArray[0]);
  const cancelledOrderIdsSet = new Set(flattenOrderIds);
  currentOpenOrders = currentOpenOrders.filter(order => !cancelledOrderIdsSet.has(order.e_orderId));
  yield put(ordersStreamMessageReceived(JSON.parse(JSON.stringify(currentOpenOrders))));
  yield put(showNotification({
    data: accountIds ? 'Successfully canceled all orders for account' : 'Successfully canceled all orders'
  }));
}


function* cancelAllOrderWatcher() {
  yield takeEvery(OPEN_ORDERS_CANCEL_ALL_ORDER, cancelAllOrderWorker);
}

function unsubscribeOpenOrdersStreamWorker() {
  logger.debug(`unsubscribing private [${SUBSCRIPTION_TYPE}]`);
  unsubscribePrivateStream(SUBSCRIPTION_TYPE);
}

function* unsubscribeOpenOrdersStreamWatcher() {
  yield takeEvery(OPEN_ORDERS_UNSUBSCRIBE_STREAM, unsubscribeOpenOrdersStreamWorker);
}

function initStream(subscriptionPayload) {
  return eventChannel((emit) => {
    subscribePrivateStream(subscriptionPayload, emit);
    return () => {};
  });
}

function updateCurrentOpenOrders(data) {
  const newOrder = {
    exchange: data.exchange,
    accountId: data.accountId,
    amount: data.amount,
    e_orderId: data.e_orderId,
    e_timestamp: data.e_timestamp,
    filled: data.filled,
    pair: data.pair,
    price: data.price,
    side: data.side,
    status: data.status,
    stop_price: data.stopPrice,
    type: data.type,
    isRequestPending: false
  };

  currentOpenOrders = currentOpenOrders.filter(currentOrder => currentOrder.e_orderId !== newOrder.e_orderId);
  // update current open orders, otherwise add to closed orders
  if (newOrder.status === 'OPEN') {
    currentOpenOrders.push(newOrder);
    currentOpenOrders.sort((a, b) => isoToUnix(b.e_timestamp) - isoToUnix(a.e_timestamp));
  } else if (newOrder.status === 'CLOSED') {
    if (!currentOrderHistory) {
      currentOrderHistory = [];
    }
    currentOrderHistory.push(newOrder);
    currentOrderHistory.sort((a, b) => isoToUnix(b.e_timestamp) - isoToUnix(a.e_timestamp));
  }
}

function* subscribeOpenOrdersStreamWorker() {
  logger.debug(`subscribing private [${SUBSCRIPTION_TYPE}]`);
  const subscriptionPayload = {
    subscriptionType: SUBSCRIPTION_TYPE, eventType: 'subscribe',
  };

  if (!streamConnected) {
    const streamEventChannel = yield call(initStream, subscriptionPayload);
    streamConnected = true;

    while (true) {
      const data = yield take(streamEventChannel);
      if (data.subscriptionType === 'RECONNECT') {
        logger.info('disconnected from open orders stream, re-initializing');
        streamEventChannel.close();
        streamConnected = false;
        yield put(subscribeOpenOrders());
      }

      if (data.subscriptionType === SUBSCRIPTION_TYPE) {
        if (data.type.toUpperCase() !== 'MARKET') {
          updateCurrentOpenOrders(data);
          yield put(ordersStreamMessageReceived(JSON.parse(JSON.stringify(currentOpenOrders))));

          const [base, quote] = data.pair.split('/');
          const filled = formatAmount(base, data.filled);
          const price = formatAmount(quote, data.price);

          if (data.status === 'OPEN' && parseFloat(data.filled) > 0 && parseFloat(data.filled) < parseFloat(data.amount)) {
            yield put(showNotification({
              data: `${data.exchange} order partially filled: ${data.side} ${filled} ${base} @ ${price} ${quote}`
            }));
          } else if (parseFloat(data.filled) === parseFloat(data.amount)) {
            yield put(showNotification({
              data: `${data.exchange} order filled: ${data.side} ${filled} ${base} @ ${price} ${quote}`
            }));
          } else if (data.status === 'OPEN' && parseFloat(data.filled) === 0) {
            yield put(showNotification({
              data: `${data.exchange} order placed: ${data.side} ${data.amount} ${base} @ ${price} ${quote}`
            }));
          } else if (data.status === 'CANCELED') {
            yield put(showNotification({
              data: `${data.exchange} order canceled: ${data.side} ${data.amount} ${base} @ ${price} ${quote}`
            }));
          }
        }
      }
    }
  } else {
    yield call(subscribePrivateStream, subscriptionPayload);
  }
}

function* subscribeOpenOrdersStreamWatcher() {
  yield takeEvery(OPEN_ORDERS_SUBSCRIBE_STREAM, subscribeOpenOrdersStreamWorker);
}

function* fetchInitialOpenOrdersStreamWorker(data) {
  const { forceFetch } = data;
  if (!streamConnected || forceFetch) {
    try {
      const openOrders = yield call(getAllOrders, 'OPEN', 500);
      if (openOrders.error) {
        logger.info(`error fetching initial open orders, re-attempting in ${reconnectTimeout}ms`);
        yield call(delay, reconnectTimeout);
        reconnectTimeout *= 2;
        yield put(subscribeOpenOrders());
        return;
      }

      reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

      currentOpenOrders = openOrders.filter(open => (open.type).toUpperCase() !== 'MARKET')
        .map((open) => {
          open.isRequestPending = false;
          return open;
        }).sort((a, b) => isoToUnix(b.e_timestamp) - isoToUnix(a.e_timestamp));

      yield put(ordersStreamMessageReceived(JSON.parse(JSON.stringify(currentOpenOrders))));
      yield put(subscribeOpenOrdersStream());
    } catch (err) {
      logger.error('error getting initial open orders', err);
      yield call(delay, reconnectTimeout);
      reconnectTimeout *= 2;
      yield put(subscribeOpenOrders());
    }
  }
}

function* fetchOrderHistoryWorker(data) {
  try {
    const { pair, accountId } = data;
    const orderHistory = yield call(getAllOrders, 'CLOSED', 100, accountId, pair);
    if (orderHistory.error) {
      logger.info('error fetching order history');
      return;
    }

    currentOrderHistory = orderHistory.sort((a, b) => isoToUnix(b.e_timestamp) - isoToUnix(a.e_timestamp));

    yield put(setOrderHistory(JSON.parse(JSON.stringify(currentOrderHistory))));
  } catch (err) {
    logger.error('error getting order history', err);
  }
}

function* fetchInitialOpenOrdersStreamWatcher() {
  yield takeEvery(OPEN_ORDERS_INIT, fetchInitialOpenOrdersStreamWorker);
}


function* fetchOrderHistoryWatcher() {
  yield takeEvery(FETCH_ORDER_HISTORY, fetchOrderHistoryWorker);
}

/* ******************************************************************************************************* */

export { // action creators
  subscribeOpenOrders,
  fetchOrderHistory,
  unsubscribeOpenOrders,
  cancelOrder,
  canceAllOrders,
};
export const sagas = [
  fetchInitialOpenOrdersStreamWatcher,
  fetchOrderHistoryWatcher,
  subscribeOpenOrdersStreamWatcher,
  unsubscribeOpenOrdersStreamWatcher,
  cancelOrderWatcher,
  cancelAllOrderWatcher,
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/global/orders.js